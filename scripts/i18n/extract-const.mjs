#!/usr/bin/env node
/**
 * 抽取顶级 StringLiteral 赋值（VariableDeclarator init 与 ObjectProperty value）
 * 中的英文文本 —— 覆盖 const X = "Hello" 与 { label: "Hello" } 两类。
 *
 * 严格启发式（避免误伤 enum/标识符/CSS）：
 *   - 必须含字母
 *   - 含空格(多词) 或 首字母大写 + 长度>=6 + 内部含小写
 *   - 不能是 URL / dot-notation / SCREAMING_CASE / query-example
 * 对 ObjectProperty 仅在 key 是常见 UI 字段名（label/title/description/help/text 等）时取
 *
 * 输出 i18n/strings-const.json
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
} from './lib/config.mjs';

const traverse = traverseModule.default || traverseModule;

const subdir = process.argv[2] || '';

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
  // 必须是多词短语：含空格 或 含英文标点。单 PascalCase 词通常是 enum/type 标识符
  if (!/\s/.test(s) && !/[.!?,:;]/.test(s)) return false;
  if (/^https?:\/\//.test(s)) return false;
  if (/^[a-z][a-zA-Z]*\.[a-z]/.test(s)) return false;
  if (/^[A-Z][A-Z0-9_]*$/.test(s)) return false;
  if (/^[a-z]+:[a-z]/.test(s)) return false;
  return true;
}

// 跳过被 TypeScript 类型注解约束的 VariableDeclarator
function hasLiteralTypeAnnotation(declaratorNode) {
  const ann = declaratorNode.id?.typeAnnotation?.typeAnnotation;
  if (!ann) return false;
  // 直接是 string literal type
  if (ann.type === 'TSLiteralType' && ann.literal?.type === 'StringLiteral') return true;
  // union of literal types (e.g. 'Asc' | 'Desc')
  if (ann.type === 'TSUnionType') {
    return ann.types.some((t) => t.type === 'TSLiteralType' && t.literal?.type === 'StringLiteral');
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
  console.log(`[const] scanning ${uniq.length} files`);

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
      ast = parse(src, { sourceType: 'module', plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'], errorRecovery: true });
    } catch (e) { parseErrors.push({ file: rel, error: e.message }); continue; }

    traverse(ast, {
      VariableDeclarator(p) {
        const init = p.node.init;
        if (init?.type !== 'StringLiteral') return;
        if (hasLiteralTypeAnnotation(p.node)) return;
        const s = normalize(init.value);
        if (!isUserVisible(s)) return;
        if (isBlacklistedString(s, ctx)) return;
        record(s, { file: rel, line: init.loc?.start.line || 0, start: init.start, end: init.end, kind: 'const' });
      },
      ObjectProperty(p) {
        const v = p.node.value;
        if (v?.type !== 'StringLiteral') return;
        const key = p.node.key?.name || p.node.key?.value;
        if (!KEY_NAMES.has(key)) return;
        const s = normalize(v.value);
        if (!isUserVisible(s)) return;
        if (isBlacklistedString(s, ctx)) return;
        record(s, { file: rel, line: v.loc?.start.line || 0, start: v.start, end: v.end, kind: `obj.${key}` });
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

  const outPath = path.join(ctx.repoRoot, 'i18n', 'strings-const.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`[const] done`);
  console.log(`  files          : ${uniq.length}`);
  console.log(`  unique strings : ${output.uniqueStrings}`);
  console.log(`  occurrences    : ${output.totalOccurrences}`);
  console.log(`  output         : i18n/strings-const.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
