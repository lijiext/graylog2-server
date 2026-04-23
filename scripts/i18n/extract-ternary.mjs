#!/usr/bin/env node
/**
 * 抽取 ternary 表达式分支里的英文字符串字面量。
 *
 * 大量按钮 toggle / 状态显示是这种形式：
 *   {open ? 'Less details' : 'More details'}
 *   {fav ? 'Remove from favorites' : 'Add to favorites'}
 *
 * 仅在 ternary 出现在以下上下文时才抽取：
 *   - JSXExpressionContainer（直接放在 JSX 中显示）
 *   - JSXAttribute 的白名单属性 value 里
 *   - 白名单 CallExpression 的参数
 *
 * 输出 i18n/strings-ternary.json
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
  isAlreadyChinese,
  isBlacklistedString,
  getCalleeName,
} from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const subdir = process.argv[2] || '';

function shouldKeep(s) {
  if (!s) return false;
  if (s.length < 2) return false;
  if (isAlreadyChinese(s)) return false;
  if (!/[A-Za-z]{2,}/.test(s)) return false;
  if (/^(auto|hidden|visible|none|block|inline|flex|grid|absolute|relative|static|fixed|sticky|true|false|null|undefined|asc|desc|left|right|center|top|bottom|small|large|medium)$/i.test(s)) return false;
  if (/^[a-z][a-zA-Z]*$/.test(s) && s.length < 8) return false;
  if (/^[a-z_]+$/.test(s) && s.length < 12) return false;
  if (/^\w+\.\w+/.test(s) && !/\s/.test(s)) return false;
  if (/^[a-z]+:[a-z]/.test(s)) return false;
  if (/^[A-Z_]+$/.test(s) && s.length < 8) return false;
  if (/^https?:\/\//.test(s)) return false;
  // 单 PascalCase 词（如 ReactError, Viewer, Ascending）通常是 enum/type 标识符
  if (/^[A-Z][a-zA-Z]*$/.test(s) && !/\s/.test(s)) return false;
  return true;
}

function hasLiteralTypeAnnotation(declaratorNode) {
  const ann = declaratorNode.id?.typeAnnotation?.typeAnnotation;
  if (!ann) return false;
  if (ann.type === 'TSLiteralType' && ann.literal?.type === 'StringLiteral') return true;
  if (ann.type === 'TSUnionType') {
    return ann.types.some((t) => t.type === 'TSLiteralType' && t.literal?.type === 'StringLiteral');
  }
  return false;
}

// 在 ternary 上方找最近的 VariableDeclarator，看其 type annotation 是否字面量类型
function ternaryHasLiteralTargetType(p) {
  let cur = p.parentPath;
  while (cur) {
    const n = cur.node;
    if (n.type === 'VariableDeclarator') return hasLiteralTypeAnnotation(n);
    if (n.type === 'CallExpression' || n.type === 'JSXAttribute' || n.type === 'Program' || n.type === 'ReturnStatement') return false;
    cur = cur.parentPath;
  }
  return false;
}

function isInWhitelistedContext(p, ctx) {
  // 强启发式：如果两个分支都是合规的英文 StringLiteral，就算是用户可见文本
  // 大量"const title = cond ? 'A' : 'B'" 模式不能依赖 parent JSX 上下文
  const c = p.node.consequent;
  const a = p.node.alternate;
  if (c?.type === 'StringLiteral' && a?.type === 'StringLiteral') {
    const sc = c.value, sa = a.value;
    if (shouldKeep(sc) && shouldKeep(sa)) return true;
  }
  // 否则按原规则：在 JSX/call/JSXExpressionContainer 上下文里
  let cur = p.parentPath;
  while (cur) {
    const n = cur.node;
    if (n.type === 'JSXAttribute') {
      const an = n.name?.name;
      const name = typeof an === 'string' ? an : an?.name || '';
      return ctx.whiteAttrs.has(name) && !ctx.blackAttrs.has(name);
    }
    if (n.type === 'CallExpression') {
      const name = getCalleeName(n.callee);
      return ctx.whiteCalls.has(name);
    }
    if (n.type === 'JSXExpressionContainer') return true;
    if (n.type === 'JSXText' || n.type === 'Program') return false;
    cur = cur.parentPath;
  }
  return false;
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
  const uniq = Array.from(new Set(files)).sort();
  console.log(`[ternary] scanning ${uniq.length} files`);

  const strings = new Map();
  const occurrences = [];
  const parseErrors = [];

  function record(source, occ) {
    const id = stableHash(source);
    let entry = strings.get(id);
    if (!entry) { entry = { id, source, occurrenceCount: 0 }; strings.set(id, entry); }
    entry.occurrenceCount += 1;
    occurrences.push({ id, ...occ });
  }

  for (const file of uniq) {
    const rel = path.relative(ctx.repoRoot, file);
    let src;
    try { src = await fs.readFile(file, 'utf8'); } catch (e) { parseErrors.push({ file: rel, error: e.message }); continue; }
    let ast;
    try {
      ast = parse(src, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
        errorRecovery: true,
      });
    } catch (e) { parseErrors.push({ file: rel, error: e.message }); continue; }

    traverse(ast, {
      ConditionalExpression(p) {
        if (!isInWhitelistedContext(p, ctx)) return;
        if (ternaryHasLiteralTargetType(p)) return;
        for (const branchKey of ['consequent', 'alternate']) {
          const branch = p.node[branchKey];
          if (!branch || branch.type !== 'StringLiteral') continue;
          const s = normalize(branch.value);
          if (!shouldKeep(s)) continue;
          if (isBlacklistedString(s, ctx)) continue;
          record(s, {
            file: rel,
            line: branch.loc?.start.line || 0,
            start: branch.start,
            end: branch.end,
            kind: `ternary:${branchKey}`,
          });
        }
      },
    });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalFiles: uniq.length,
    uniqueStrings: strings.size,
    totalOccurrences: occurrences.length,
    parseErrorCount: parseErrors.length,
    strings: Array.from(strings.values()).sort((a, b) => b.occurrenceCount - a.occurrenceCount),
    occurrences,
    parseErrors,
  };

  const outPath = path.join(ctx.repoRoot, 'i18n', 'strings-ternary.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`[ternary] done`);
  console.log(`  files          : ${uniq.length}`);
  console.log(`  unique strings : ${output.uniqueStrings}`);
  console.log(`  occurrences    : ${output.totalOccurrences}`);
  console.log(`  output         : i18n/strings-ternary.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
