#!/usr/bin/env node
/**
 * AST 回写：读 i18n/translations.json，把翻译回写到 TSX 源文件。
 *
 * 策略：定位节点 start/end → 字符串切片替换，保留引号、空白、代码格式。
 *       幂等：已是中文则跳过；未翻译则跳过。
 *
 * 用法：
 *   node apply.mjs                    # 全量
 *   node apply.mjs <subdir>           # 只处理某子目录
 *   node apply.mjs --dry-run          # 只统计不写入
 *   node apply.mjs --limit-files 10   # 只处理前 N 个文件
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import {
  loadConfig,
  normalize,
  isAlreadyChinese,
  isBlacklistedString,
  getCalleeName,
} from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const positional = [];
const flags = new Set();
let limitFiles = Infinity;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--dry-run') flags.add('dryRun');
  else if (a === '--limit-files') {
    limitFiles = parseInt(argv[++i], 10);
  } else positional.push(a);
}
const subdir = positional[0] || '';
const dryRun = flags.has('dryRun');

function applyPatches(src, patches) {
  patches.sort((a, b) => b.start - a.start);
  let out = src;
  for (const p of patches) {
    out = out.slice(0, p.start) + p.replacement + out.slice(p.end);
  }
  return out;
}

function quoteOf(node) {
  // StringLiteral 节点的原始引号
  const raw = node.extra?.raw;
  if (raw && (raw.startsWith("'") || raw.startsWith('"'))) return raw[0];
  return '"';
}

function escapeForQuote(s, q) {
  return s.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), `\\${q}`);
}

function escapeJsxText(s) {
  // JSX 文本里 { } 是表达式边界，< > 是标签边界，全部用 HTML 实体转义。
  return s
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

async function processFile(file, ctx, translations) {
  const rel = path.relative(ctx.repoRoot, file);
  const src = await fs.readFile(file, 'utf8');
  let ast;
  try {
    ast = parse(src, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
      errorRecovery: true,
    });
  } catch (e) {
    return { file: rel, skipped: `parse: ${e.message}` };
  }

  const patches = [];

  traverse(ast, {
    JSXText(p) {
      const raw = p.node.value;
      const trimmed = normalize(raw);
      if (!trimmed) return;
      if (isAlreadyChinese(trimmed)) return;
      if (isBlacklistedString(trimmed, ctx)) return;
      const zh = translations[trimmed];
      if (!zh || zh === trimmed) return;

      const leading = raw.match(/^\s*/)[0];
      const trailing = raw.match(/\s*$/)[0];
      patches.push({
        start: p.node.start,
        end: p.node.end,
        replacement: leading + escapeJsxText(zh) + trailing,
        kind: 'JSXText',
      });
    },

    JSXAttribute(p) {
      const nameNode = p.node.name;
      const name = typeof nameNode.name === 'string' ? nameNode.name : nameNode.name?.name || '';
      if (!ctx.whiteAttrs.has(name)) return;
      if (ctx.blackAttrs.has(name)) return;
      const v = p.node.value;
      if (!v) return;

      if (v.type === 'StringLiteral') {
        const s = v.value;
        if (isAlreadyChinese(s)) return;
        if (isBlacklistedString(s, ctx)) return;
        const zh = translations[s];
        if (!zh || zh === s) return;
        const q = quoteOf(v);
        patches.push({
          start: v.start,
          end: v.end,
          replacement: `${q}${escapeForQuote(zh, q)}${q}`,
          kind: `attr:${name}`,
        });
        return;
      }

      if (v.type === 'JSXExpressionContainer' && v.expression?.type === 'StringLiteral') {
        const lit = v.expression;
        const s = lit.value;
        if (isAlreadyChinese(s)) return;
        if (isBlacklistedString(s, ctx)) return;
        const zh = translations[s];
        if (!zh || zh === s) return;
        const q = quoteOf(lit);
        patches.push({
          start: lit.start,
          end: lit.end,
          replacement: `${q}${escapeForQuote(zh, q)}${q}`,
          kind: `attr:${name}`,
        });
      }
    },

    CallExpression(p) {
      const name = getCalleeName(p.node.callee);
      if (!ctx.whiteCalls.has(name)) return;
      for (const arg of p.node.arguments) {
        if (arg.type !== 'StringLiteral') continue;
        const s = arg.value;
        if (isAlreadyChinese(s)) continue;
        if (isBlacklistedString(s, ctx)) continue;
        const zh = translations[s];
        if (!zh || zh === s) continue;
        const q = quoteOf(arg);
        patches.push({
          start: arg.start,
          end: arg.end,
          replacement: `${q}${escapeForQuote(zh, q)}${q}`,
          kind: `call:${name}`,
        });
      }
    },
  });

  if (patches.length === 0) return { file: rel, changed: 0 };

  const out = applyPatches(src, patches);
  if (!dryRun) await fs.writeFile(file, out);
  return { file: rel, changed: patches.length, kinds: patches.map((p) => p.kind) };
}

async function main() {
  const ctx = await loadConfig();
  const transPath = path.join(ctx.repoRoot, ctx.config.output.translations);
  const transDoc = JSON.parse(await fs.readFile(transPath, 'utf8'));
  const translations = transDoc.translations;

  const srcRoot = path.join(ctx.repoRoot, ctx.config.paths.frontend.root, subdir);
  const includes = ctx.config.paths.frontend.include;
  const excludes = ctx.config.paths.frontend.exclude.concat(ctx.blackFilePatterns);
  const files = [];
  for (const pat of includes) {
    const found = await glob(pat, { cwd: srcRoot, ignore: excludes, absolute: true, nodir: true });
    files.push(...found);
  }
  const uniqFiles = Array.from(new Set(files)).sort().slice(0, limitFiles);

  console.log(`[apply] files to process: ${uniqFiles.length}`);
  console.log(`[apply] translations available: ${Object.keys(translations).length}`);
  console.log(`[apply] dry-run: ${dryRun}`);

  let totalChanged = 0;
  let totalFilesChanged = 0;
  const parseSkipped = [];
  const kindCount = {};

  for (const file of uniqFiles) {
    const res = await processFile(file, ctx, translations);
    if (res.skipped) {
      parseSkipped.push({ file: res.file, reason: res.skipped });
      continue;
    }
    if (res.changed > 0) {
      totalChanged += res.changed;
      totalFilesChanged += 1;
      res.kinds.forEach((k) => {
        kindCount[k] = (kindCount[k] || 0) + 1;
      });
    }
  }

  console.log(`\n[apply] done`);
  console.log(`  files changed      : ${totalFilesChanged}`);
  console.log(`  string changes     : ${totalChanged}`);
  console.log(`  parse skipped      : ${parseSkipped.length}`);
  console.log(`  kinds:`);
  Object.entries(kindCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([k, v]) => console.log(`    ${k.padEnd(40)} ${v}`));

  if (parseSkipped.length) {
    console.log(`\n  parse-skipped files:`);
    parseSkipped.forEach((e) => console.log(`    ${e.file}: ${e.reason}`));
  }

  if (dryRun) console.log(`\n  (dry-run: no files written)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
