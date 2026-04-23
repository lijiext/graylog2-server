#!/usr/bin/env node
/**
 * AST 抽取：扫 graylog2-web-interface/src，产出 i18n/strings.json
 *
 * 用法：
 *   node extract.mjs            # 全量扫描
 *   node extract.mjs <subdir>   # 只扫某子目录（相对 src/）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import {
  loadConfig,
  normalize,
  stableHash,
  isBlacklistedString,
  getCalleeName,
  isUnderBlacklistedCall,
} from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const subdir = process.argv[2] || '';

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

  console.log(`[extract] scanning ${uniqFiles.length} files under ${path.relative(ctx.repoRoot, srcRoot)}`);

  const strings = new Map();
  const dynamics = [];
  const parseErrors = [];

  function record(source, occ) {
    const key = stableHash(source);
    let entry = strings.get(key);
    if (!entry) {
      entry = { id: key, source, occurrences: [] };
      strings.set(key, entry);
    }
    entry.occurrences.push(occ);
  }

  for (const file of uniqFiles) {
    const rel = path.relative(ctx.repoRoot, file);
    let src;
    try {
      src = await fs.readFile(file, 'utf8');
    } catch (e) {
      parseErrors.push({ file: rel, error: `read: ${e.message}` });
      continue;
    }
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
      JSXText(p) {
        const text = normalize(p.node.value);
        if (isBlacklistedString(text, ctx)) return;
        record(text, { file: rel, line: p.node.loc?.start.line || 0, kind: 'JSXText' });
      },

      JSXAttribute(p) {
        const name = p.node.name.name;
        const nameStr = typeof name === 'string' ? name : name?.name || '';
        if (!ctx.whiteAttrs.has(nameStr)) return;
        if (ctx.blackAttrs.has(nameStr)) return;
        const v = p.node.value;
        if (!v) return;

        if (v.type === 'StringLiteral') {
          const s = v.value;
          if (isBlacklistedString(s, ctx)) return;
          record(s, { file: rel, line: v.loc?.start.line || 0, kind: `attr:${nameStr}` });
          return;
        }

        if (v.type === 'JSXExpressionContainer') {
          const expr = v.expression;
          if (!expr) return;
          if (expr.type === 'StringLiteral') {
            const s = expr.value;
            if (isBlacklistedString(s, ctx)) return;
            record(s, { file: rel, line: expr.loc?.start.line || 0, kind: `attr:${nameStr}` });
          } else if (expr.type === 'TemplateLiteral') {
            dynamics.push({
              file: rel,
              line: expr.loc?.start.line || 0,
              kind: `attr:${nameStr}:template`,
              preview: src.slice(expr.start, expr.end),
            });
          }
        }
      },

      CallExpression(p) {
        const name = getCalleeName(p.node.callee);
        if (!ctx.whiteCalls.has(name)) return;
        p.node.arguments.forEach((arg, i) => {
          if (arg.type === 'StringLiteral') {
            const s = arg.value;
            if (isBlacklistedString(s, ctx)) return;
            record(s, { file: rel, line: arg.loc?.start.line || 0, kind: `call:${name}:arg${i}` });
          } else if (arg.type === 'TemplateLiteral') {
            dynamics.push({
              file: rel,
              line: arg.loc?.start.line || 0,
              kind: `call:${name}:arg${i}:template`,
              preview: src.slice(arg.start, arg.end),
            });
          }
        });
      },

      TemplateLiteral(p) {
        const parent = p.parent;
        const parentType = parent?.type;
        if (!['JSXExpressionContainer', 'ReturnStatement'].includes(parentType)) return;
        if (isUnderBlacklistedCall(p, ctx.blackCallSites)) return;

        // 检查是否在黑名单属性（className、id、key 等）里
        let ancestor = p.parentPath;
        let inBlackAttr = false;
        while (ancestor) {
          if (ancestor.node.type === 'JSXAttribute') {
            const an = ancestor.node.name?.name;
            if (typeof an === 'string' && (ctx.blackAttrs.has(an) || !ctx.whiteAttrs.has(an))) {
              inBlackAttr = true;
            }
            break;
          }
          ancestor = ancestor.parentPath;
        }
        if (inBlackAttr) return;

        const raw = p.node.quasis.map((q) => q.value.cooked).join('');
        // 必须含至少 3 个连续英文字母
        if (!/[A-Za-z]{3,}/.test(raw)) return;
        // 排除纯标识符样（无空格、无中文标点）
        if (!/\s/.test(raw) && !/[.!?,:;]/.test(raw)) return;
        // 长度过滤：至少 4 字符有意义内容
        if (raw.trim().length < 4) return;

        dynamics.push({
          file: rel,
          line: p.node.loc?.start.line || 0,
          kind: 'TemplateLiteral',
          preview: raw,
        });
      },
    });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalFiles: uniqFiles.length,
    totalUnique: strings.size,
    totalOccurrences: Array.from(strings.values()).reduce((acc, e) => acc + e.occurrences.length, 0),
    dynamicCount: dynamics.length,
    parseErrorCount: parseErrors.length,
    strings: Array.from(strings.values()).sort((a, b) => a.source.localeCompare(b.source)),
    dynamics: dynamics.sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`)),
    parseErrors,
  };

  const outPath = path.join(ctx.repoRoot, ctx.config.output.strings);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));

  console.log(`[extract] done`);
  console.log(`  files scanned    : ${uniqFiles.length}`);
  console.log(`  unique strings   : ${output.totalUnique}`);
  console.log(`  total occurrences: ${output.totalOccurrences}`);
  console.log(`  dynamic (manual) : ${output.dynamicCount}`);
  console.log(`  parse errors     : ${output.parseErrorCount}`);
  console.log(`  output           : ${ctx.config.output.strings}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
