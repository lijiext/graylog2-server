#!/usr/bin/env node
/**
 * 后端 apply：读 i18n/translations-backend.json，把 Java 源码中匹配的英文字符串替换为中文。
 *
 * 策略：与 extract-backend.mjs 使用相同正则重新扫描，匹配到 source 后对字符串字面量做定点替换。
 *       幂等（已是中文的跳过）。
 *
 * 用法：
 *   node apply-backend.mjs
 *   node apply-backend.mjs --dry-run
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { loadConfig, normalize, isAlreadyChinese } from './lib/config.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const REST_EXCEPTIONS = [
  'BadRequestException',
  'NotFoundException',
  'ForbiddenException',
  'UnauthorizedException',
  'NotAuthorizedException',
  'ConflictException',
  'InternalServerErrorException',
  'WebApplicationException',
  'ValidationException',
  'ParameterException',
  'PermanentEventNotificationException',
  'TransientEventNotificationException',
  'ContentPackException',
  'ConfigurationException',
];

function buildRegexes() {
  return [
    {
      kind: 'throw',
      rx: new RegExp(
        `(throw\\s+new\\s+(?:${REST_EXCEPTIONS.join('|')})\\s*\\(\\s*)"((?:[^"\\\\]|\\\\.)+)"`,
        'g',
      ),
      strGroup: 2,
      prefixGroup: 1,
    },
    {
      kind: 'factory',
      rx: /(\b[A-Z][A-Za-z]+Exception\.create\s*\(\s*)"((?:[^"\\]|\\.)+)"/g,
      strGroup: 2,
      prefixGroup: 1,
    },
    {
      kind: 'swagger',
      rx: new RegExp(
        '(@(?:ApiOperation|ApiParam|ApiResponse|ApiModelProperty|Schema|ApiImplicitParam)' +
          '\\s*\\([^)]*?(?:value|description|message|notes)\\s*=\\s*)"((?:[^"\\\\]|\\\\.)+)"',
        'g',
      ),
      strGroup: 2,
      prefixGroup: 1,
    },
    {
      kind: 'swagger-short',
      rx: /(@ApiOperation\s*\(\s*)"((?:[^"\\]|\\.)+)"\s*\)/g,
      strGroup: 2,
      prefixGroup: 1,
    },
  ];
}

function unescapeJavaString(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function escapeJavaString(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

async function main() {
  const ctx = await loadConfig();
  const transPath = path.join(ctx.repoRoot, 'i18n', 'translations-backend.json');
  let transDoc;
  try {
    transDoc = JSON.parse(await fs.readFile(transPath, 'utf8'));
  } catch (e) {
    console.error(`[apply-be] no translations file yet: ${transPath}`);
    console.error(`         run: node translate.mjs --input i18n/strings-backend.json --output i18n/translations-backend.json`);
    process.exit(1);
  }
  const translations = transDoc.translations || {};

  const roots = ctx.config.paths.backend.javaRoots;
  const javaFiles = [];
  for (const root of roots) {
    const abs = path.join(ctx.repoRoot, root);
    const found = await glob('**/*.java', {
      cwd: abs,
      absolute: true,
      nodir: true,
      ignore: ['**/test/**', '**/it/**', '**/*Test.java', '**/*IT.java'],
    });
    javaFiles.push(...found);
  }

  console.log(`[apply-be] scanning ${javaFiles.length} Java files`);
  console.log(`[apply-be] translations available: ${Object.keys(translations).length}`);
  console.log(`[apply-be] dry-run: ${dryRun}`);

  const regexes = buildRegexes();
  let filesChanged = 0;
  let totalReplacements = 0;
  const kindCount = {};

  for (const file of javaFiles) {
    const rel = path.relative(ctx.repoRoot, file);
    const src = await fs.readFile(file, 'utf8');
    const patches = [];

    for (const r of regexes) {
      r.rx.lastIndex = 0;
      let m;
      while ((m = r.rx.exec(src)) !== null) {
        const raw = m[r.strGroup];
        const source = normalize(unescapeJavaString(raw));
        const zh = translations[source];
        if (!zh || zh === source) continue;
        if (isAlreadyChinese(raw)) continue;

        // 定位整个 "..." 范围（相对 m.index）
        const before = m[0].slice(0, m[0].indexOf(`"${raw}"`));
        const strStart = m.index + before.length;
        const strEnd = strStart + raw.length + 2; // 含两个引号

        patches.push({
          start: strStart,
          end: strEnd,
          replacement: `"${escapeJavaString(zh)}"`,
          kind: r.kind,
        });
      }
    }

    if (patches.length === 0) continue;

    // 去重（同一位置被多个 regex 捕获时）
    const seen = new Set();
    const deduped = [];
    for (const p of patches) {
      const key = `${p.start}-${p.end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(p);
    }
    deduped.sort((a, b) => b.start - a.start);

    let out = src;
    for (const p of deduped) {
      out = out.slice(0, p.start) + p.replacement + out.slice(p.end);
      kindCount[p.kind] = (kindCount[p.kind] || 0) + 1;
    }

    if (!dryRun) await fs.writeFile(file, out);
    filesChanged += 1;
    totalReplacements += deduped.length;
  }

  console.log(`\n[apply-be] done`);
  console.log(`  files changed      : ${filesChanged}`);
  console.log(`  total replacements : ${totalReplacements}`);
  console.log(`  kinds:`);
  Object.entries(kindCount).forEach(([k, v]) => console.log(`    ${k.padEnd(20)} ${v}`));
  if (dryRun) console.log(`  (dry-run: no files written)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
