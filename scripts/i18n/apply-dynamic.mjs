#!/usr/bin/env node
/**
 * 回写动态 TemplateLiteral：
 *   读 i18n/translations-dynamic.json → 匹配源码里的 TemplateLiteral → 重组模板字符串
 *
 * 重组逻辑：
 *   原: `quasi0${expr0}quasi1${expr1}quasi2`  (shape = quasi0 + {0} + quasi1 + {1} + quasi2)
 *   译: "zh0{idx0}zh1{idx1}zh2"  (Chinese with possibly reordered placeholders)
 *   新: `zh0${exprSources[idx0]}zh1${exprSources[idx1]}zh2`
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import {
  loadConfig,
  isAlreadyChinese,
  isBlacklistedString,
  getCalleeName,
  isUnderBlacklistedCall,
} from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const positional = [];
const flags = new Set();
let limitFiles = Infinity;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--dry-run') flags.add('dryRun');
  else if (a === '--limit-files') limitFiles = parseInt(argv[++i], 10);
  else positional.push(a);
}
const subdir = positional[0] || '';
const dryRun = flags.has('dryRun');

function computeShape(node) {
  const parts = [];
  node.quasis.forEach((q, i) => {
    parts.push(q.value.cooked);
    if (i < node.expressions.length) parts.push(`{${i}}`);
  });
  return parts.join('');
}

function shouldConsider(shape) {
  if (!/[A-Za-z]{3,}/.test(shape)) return false;
  if (isAlreadyChinese(shape)) return false;
  if (shape.trim().length < 4) return false;
  if (!/\s/.test(shape) && !/[.!?,:;]/.test(shape) && shape.replace(/\{\d+\}/g, '').length < 6) return false;
  return true;
}

// 把中文文本里的 ` 和 \ 和 ${ 转义，安全放入模板字符串
function escapeTemplateText(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function buildNewTemplate(zh, exprSources) {
  // 把 zh 按 {N} 拆分
  const regex = /\{(\d+)\}/g;
  let last = 0;
  const parts = [];
  let m;
  while ((m = regex.exec(zh))) {
    const text = zh.slice(last, m.index);
    parts.push({ kind: 'text', value: text });
    parts.push({ kind: 'expr', idx: parseInt(m[1], 10) });
    last = regex.lastIndex;
  }
  parts.push({ kind: 'text', value: zh.slice(last) });

  let out = '`';
  for (const p of parts) {
    if (p.kind === 'text') out += escapeTemplateText(p.value);
    else {
      const src = exprSources[p.idx];
      if (src == null) return null;
      out += '${' + src + '}';
    }
  }
  out += '`';
  return out;
}

function applyPatches(src, patches) {
  patches.sort((a, b) => b.start - a.start);
  let out = src;
  for (const p of patches) {
    out = out.slice(0, p.start) + p.replacement + out.slice(p.end);
  }
  return out;
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
    TemplateLiteral(p) {
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

      const zh = translations[shape];
      if (!zh || zh === shape) return;

      // 校验占位符数量
      const want = new Set(shape.match(/\{\d+\}/g) || []);
      const got = new Set(zh.match(/\{\d+\}/g) || []);
      if (want.size !== got.size) return;
      for (const w of want) if (!got.has(w)) return;

      const exprSources = p.node.expressions.map((e) => src.slice(e.start, e.end));
      const replacement = buildNewTemplate(zh, exprSources);
      if (!replacement) return;

      patches.push({
        start: p.node.start,
        end: p.node.end,
        replacement,
        shape,
      });
    },
  });

  if (patches.length === 0) return { file: rel, changed: 0 };
  const out = applyPatches(src, patches);
  if (!dryRun) await fs.writeFile(file, out);
  return { file: rel, changed: patches.length };
}

async function main() {
  const ctx = await loadConfig();
  const transPath = path.join(ctx.repoRoot, 'i18n', 'translations-dynamic.json');
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

  console.log(`[apply-dyn] files : ${uniqFiles.length}`);
  console.log(`[apply-dyn] shapes: ${Object.keys(translations).length}`);
  console.log(`[apply-dyn] dry-run: ${dryRun}`);

  let totalChanged = 0, filesChanged = 0;
  const parseSkipped = [];
  for (const f of uniqFiles) {
    const r = await processFile(f, ctx, translations);
    if (r.skipped) { parseSkipped.push(r); continue; }
    if (r.changed > 0) { totalChanged += r.changed; filesChanged += 1; }
  }

  console.log(`\n[apply-dyn] done`);
  console.log(`  files changed : ${filesChanged}`);
  console.log(`  replacements  : ${totalChanged}`);
  console.log(`  parse skipped : ${parseSkipped.length}`);
  if (dryRun) console.log(`  (dry-run: no writes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
