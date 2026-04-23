#!/usr/bin/env node
/**
 * 抽取动态 TemplateLiteral → i18n/strings-dynamic.json
 *
 * 每个 TemplateLiteral 的 shape 形式:
 *   quasis.join('{N}')  →  "Delete {0}"
 * 相同 shape 共享一条翻译。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import {
  loadConfig,
  stableHash,
  isAlreadyChinese,
  isBlacklistedString,
  getCalleeName,
  isUnderBlacklistedCall,
} from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const subdir = process.argv[2] || '';

function computeShape(node) {
  const parts = [];
  node.quasis.forEach((q, i) => {
    parts.push(q.value.cooked);
    if (i < node.expressions.length) parts.push(`{${i}}`);
  });
  return parts.join('');
}

function shouldConsider(shape) {
  // 必须含 3 个以上连续英文字母
  if (!/[A-Za-z]{3,}/.test(shape)) return false;
  // 已是中文则跳过
  if (isAlreadyChinese(shape)) return false;
  // 过短且无分隔符则跳过（大概率是标识符）
  if (shape.trim().length < 4) return false;
  if (!/\s/.test(shape) && !/[.!?,:;]/.test(shape) && shape.replace(/\{\d+\}/g, '').length < 6) return false;
  return true;
}

async function main() {
  const ctx = await loadConfig();
  const srcRoot = path.join(ctx.repoRoot, ctx.config.paths.frontend.root, subdir);
  const includes = ctx.config.paths.frontend.include;
  const excludes = ctx.config.paths.frontend.exclude.concat(ctx.blackFilePatterns);

  const files = [];
  for (const pat of includes) {
    const found = await glob(pat, { cwd: srcRoot, ignore: excludes, absolute: true, nodir: true });
    files.push(...found);
  }
  const uniqFiles = Array.from(new Set(files)).sort();
  console.log(`[extract-dynamic] scanning ${uniqFiles.length} files`);

  const shapes = new Map();
  const occurrences = [];
  const parseErrors = [];

  function record(shape, occ) {
    const id = stableHash(shape);
    let entry = shapes.get(id);
    if (!entry) {
      entry = { id, shape, occurrenceCount: 0 };
      shapes.set(id, entry);
    }
    entry.occurrenceCount += 1;
    occurrences.push({ id, ...occ });
  }

  for (const file of uniqFiles) {
    const rel = path.relative(ctx.repoRoot, file);
    let src;
    try { src = await fs.readFile(file, 'utf8'); }
    catch (e) { parseErrors.push({ file: rel, error: `read: ${e.message}` }); continue; }
    let ast;
    try {
      ast = parse(src, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
        errorRecovery: true,
      });
    } catch (e) {
      parseErrors.push({ file: rel, error: `parse: ${e.message}` });
      continue;
    }

    traverse(ast, {
      TemplateLiteral(p) {
        // 过滤：必须在白名单上下文
        // 1) JSXExpressionContainer 下且属性在白名单
        // 2) CallExpression 参数且函数在白名单
        // 3) ReturnStatement 里（泛用场景）
        let ok = false;
        let ancestor = p.parentPath;
        while (ancestor) {
          const n = ancestor.node;
          if (n.type === 'JSXAttribute') {
            const an = n.name?.name;
            const name = typeof an === 'string' ? an : an?.name || '';
            if (ctx.whiteAttrs.has(name) && !ctx.blackAttrs.has(name)) ok = true;
            break;
          }
          if (n.type === 'CallExpression') {
            const name = getCalleeName(n.callee);
            if (ctx.whiteCalls.has(name)) ok = true;
            break;
          }
          if (n.type === 'ReturnStatement' || n.type === 'JSXExpressionContainer') {
            // 继续向上查是否在黑名单里
            ancestor = ancestor.parentPath;
            continue;
          }
          ancestor = ancestor.parentPath;
        }
        if (!ok) return;
        if (isUnderBlacklistedCall(p, ctx.blackCallSites)) return;

        const shape = computeShape(p.node);
        if (!shouldConsider(shape)) return;
        if (isBlacklistedString(shape, ctx)) return;

        record(shape, {
          file: rel,
          line: p.node.loc?.start.line || 0,
          start: p.node.start,
          end: p.node.end,
          exprSources: p.node.expressions.map((e) => src.slice(e.start, e.end)),
          quasiCount: p.node.quasis.length,
          rawPreview: src.slice(p.node.start, p.node.end).slice(0, 200),
        });
      },
    });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalFiles: uniqFiles.length,
    uniqueShapes: shapes.size,
    totalOccurrences: occurrences.length,
    parseErrorCount: parseErrors.length,
    shapes: Array.from(shapes.values()).sort((a, b) => b.occurrenceCount - a.occurrenceCount),
    occurrences,
    parseErrors,
  };

  const outPath = path.join(ctx.repoRoot, 'i18n', 'strings-dynamic.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`[extract-dynamic] done`);
  console.log(`  files scanned  : ${uniqFiles.length}`);
  console.log(`  unique shapes  : ${output.uniqueShapes}`);
  console.log(`  occurrences    : ${output.totalOccurrences}`);
  console.log(`  parse errors   : ${output.parseErrorCount}`);
  console.log(`  output         : i18n/strings-dynamic.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
