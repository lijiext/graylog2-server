#!/usr/bin/env node
/**
 * 回写 ternary 表达式分支字面量。
 *   {open ? 'More details' : 'Less details'}  →  {open ? '更多详情' : '更少详情'}
 *
 * 切片替换 StringLiteral 节点 start/end，保留原引号。
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

const flags = new Set();
let limitFiles = Infinity;
const positional = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--dry-run') flags.add('dryRun');
  else if (a === '--limit-files') limitFiles = parseInt(argv[++i], 10);
  else positional.push(a);
}
const subdir = positional[0] || '';
const dryRun = flags.has('dryRun');

function shouldKeep(s) {
  if (!s || s.length < 2) return false;
  if (isAlreadyChinese(s)) return false;
  if (!/[A-Za-z]{2,}/.test(s)) return false;
  if (/^(auto|hidden|visible|none|block|inline|flex|grid|absolute|relative|static|fixed|sticky|true|false|null|undefined|asc|desc|left|right|center|top|bottom|small|large|medium)$/i.test(s)) return false;
  if (/^[a-z][a-zA-Z]*$/.test(s) && s.length < 8) return false;
  if (/^[a-z_]+$/.test(s) && s.length < 12) return false;
  if (/^\w+\.\w+/.test(s) && !/\s/.test(s)) return false;
  if (/^[a-z]+:[a-z]/.test(s)) return false;
  if (/^[A-Z_]+$/.test(s) && s.length < 8) return false;
  if (/^https?:\/\//.test(s)) return false;
  return true;
}

function isInWhitelistedContext(p, ctx) {
  const c = p.node.consequent;
  const a = p.node.alternate;
  if (c?.type === 'StringLiteral' && a?.type === 'StringLiteral') {
    if (shouldKeep(c.value) && shouldKeep(a.value)) return true;
  }
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

function quoteOf(node) {
  const raw = node.extra?.raw;
  if (raw && (raw.startsWith("'") || raw.startsWith('"'))) return raw[0];
  return '"';
}

function escapeForQuote(s, q) {
  return s.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), `\\${q}`);
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
    ConditionalExpression(p) {
      if (!isInWhitelistedContext(p, ctx)) return;
      for (const branchKey of ['consequent', 'alternate']) {
        const branch = p.node[branchKey];
        if (!branch || branch.type !== 'StringLiteral') continue;
        const s = normalize(branch.value);
        if (!shouldKeep(s)) continue;
        if (isBlacklistedString(s, ctx)) continue;
        const zh = translations[s];
        if (!zh || zh === s) continue;
        const q = quoteOf(branch);
        patches.push({
          start: branch.start,
          end: branch.end,
          replacement: `${q}${escapeForQuote(zh, q)}${q}`,
        });
      }
    },
  });

  if (patches.length === 0) return { file: rel, changed: 0 };
  const out = applyPatches(src, patches);
  if (!dryRun) await fs.writeFile(file, out);
  return { file: rel, changed: patches.length };
}

async function main() {
  const ctx = await loadConfig();
  const transPath = path.join(ctx.repoRoot, 'i18n', 'translations-ternary.json');
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
  const uniq = Array.from(new Set(files)).sort().slice(0, limitFiles);

  console.log(`[apply-ternary] files  : ${uniq.length}`);
  console.log(`[apply-ternary] strings: ${Object.keys(translations).length}`);
  console.log(`[apply-ternary] dry-run: ${dryRun}`);

  let totalChanged = 0, filesChanged = 0;
  const skipped = [];
  for (const f of uniq) {
    const r = await processFile(f, ctx, translations);
    if (r.skipped) { skipped.push(r); continue; }
    if (r.changed > 0) { totalChanged += r.changed; filesChanged += 1; }
  }

  console.log(`\n[apply-ternary] done`);
  console.log(`  files changed : ${filesChanged}`);
  console.log(`  replacements  : ${totalChanged}`);
  console.log(`  parse skipped : ${skipped.length}`);
  if (dryRun) console.log(`  (dry-run: no writes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
