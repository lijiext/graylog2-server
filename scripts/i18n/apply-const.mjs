#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { loadConfig, normalize, isAlreadyChinese, isBlacklistedString } from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const flags = new Set();
const positional = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--dry-run') flags.add('dryRun');
  else positional.push(a);
}
const subdir = positional[0] || '';
const dryRun = flags.has('dryRun');

const KEY_NAMES = new Set([
  'label', 'title', 'description', 'help', 'helpText', 'tooltip', 'heading',
  'caption', 'subtitle', 'subheader', 'header', 'placeholder', 'message',
  'errorMessage', 'successMessage', 'warningMessage', 'infoMessage',
  'emptyMessage', 'emptyText', 'noDataText', 'loadingText',
  'submitText', 'submitButtonText', 'cancelText', 'cancelButtonText',
  'buttonText', 'confirmText', 'name', 'displayName', 'text',
]);

function isUserVisible(s) {
  if (!s || s.length < 4) return false;
  if (!/[A-Za-z]/.test(s)) return false;
  if (isAlreadyChinese(s)) return false;
  if (!/\s/.test(s) && !(/^[A-Z]/.test(s) && s.length >= 6 && /[A-Z][a-z]/.test(s))) return false;
  if (/^https?:\/\//.test(s)) return false;
  if (/^[a-z][a-zA-Z]*\.[a-z]/.test(s)) return false;
  if (/^[A-Z][A-Z0-9_]*$/.test(s)) return false;
  if (/^[a-z]+:[a-z]/.test(s)) return false;
  return true;
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
  for (const p of patches) out = out.slice(0, p.start) + p.replacement + out.slice(p.end);
  return out;
}

async function processFile(file, ctx, translations) {
  const rel = path.relative(ctx.repoRoot, file);
  const src = await fs.readFile(file, 'utf8');
  let ast;
  try {
    ast = parse(src, { sourceType: 'module', plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'], errorRecovery: true });
  } catch (e) { return { file: rel, skipped: e.message }; }

  const patches = [];

  function tryRecord(node) {
    if (node?.type !== 'StringLiteral') return;
    const s = normalize(node.value);
    if (!isUserVisible(s)) return;
    if (isBlacklistedString(s, ctx)) return;
    const zh = translations[s];
    if (!zh || zh === s) return;
    const q = quoteOf(node);
    patches.push({ start: node.start, end: node.end, replacement: `${q}${escapeForQuote(zh, q)}${q}` });
  }

  traverse(ast, {
    VariableDeclarator(p) { tryRecord(p.node.init); },
    ObjectProperty(p) {
      const key = p.node.key?.name || p.node.key?.value;
      if (KEY_NAMES.has(key)) tryRecord(p.node.value);
    },
  });

  if (!patches.length) return { file: rel, changed: 0 };
  const out = applyPatches(src, patches);
  if (!dryRun) await fs.writeFile(file, out);
  return { file: rel, changed: patches.length };
}

async function main() {
  const ctx = await loadConfig();
  const transPath = path.join(ctx.repoRoot, 'i18n', 'translations-const.json');
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
  const uniq = Array.from(new Set(files)).sort();

  console.log(`[apply-const] files  : ${uniq.length}`);
  console.log(`[apply-const] strings: ${Object.keys(translations).length}`);
  console.log(`[apply-const] dry-run: ${dryRun}`);

  let totalChanged = 0, filesChanged = 0;
  const skipped = [];
  for (const f of uniq) {
    const r = await processFile(f, ctx, translations);
    if (r.skipped) { skipped.push(r); continue; }
    if (r.changed > 0) { totalChanged += r.changed; filesChanged += 1; }
  }

  console.log(`\n[apply-const] done`);
  console.log(`  files changed : ${filesChanged}`);
  console.log(`  replacements  : ${totalChanged}`);
  console.log(`  parse skipped : ${skipped.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
