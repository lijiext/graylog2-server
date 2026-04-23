#!/usr/bin/env node
/**
 * 后端抽取：扫 Java 源码 + FreeMarker 模板。
 *
 * 产出：
 *   i18n/strings-backend.json   —— 可走 translate.mjs 的字符串清单
 *   i18n/ftl-files.json         —— FreeMarker 模板列表（整文件翻译）
 *
 * 扫描范围：
 *   - throw new <WhitelistException>("<text>") — REST resource 用户可见异常
 *   - @ApiOperation/@ApiParam/@ApiResponse/@ApiModelProperty/@Schema value 与 description
 *   - NotFoundException.create("<text>")
 *
 * 不抽取：
 *   - LOG/log/Logger 调用
 *   - RuntimeException/IllegalStateException/IllegalArgumentException 等（多为内部 bug）
 *   - 字符串拼接 "a " + b
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { loadConfig, normalize, isAlreadyChinese, stableHash } from './lib/config.mjs';

// REST-visible exceptions（会经 JAX-RS 直接返给 API 调用者）
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

const throwRegex = new RegExp(
  `throw\\s+new\\s+(?:${REST_EXCEPTIONS.join('|')})\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)+)"\\s*[,)]`,
  'g',
);

const factoryCreateRegex = /\b([A-Z][A-Za-z]+Exception)\.create\s*\(\s*"((?:[^"\\]|\\.)+)"\s*[,)]/g;

const apiAnnotationsRegex = new RegExp(
  '@(?:ApiOperation|ApiParam|ApiResponse|ApiModelProperty|Schema|ApiImplicitParam)' +
    '\\s*\\(' +
    '[^)]*?(?:value|description|message|notes)\\s*=\\s*"((?:[^"\\\\]|\\\\.)+)"',
  'g',
);

const shortApiOpRegex = /@ApiOperation\s*\(\s*"((?:[^"\\]|\\.)+)"\s*\)/g;

function unescapeJavaString(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function looksLikeUserText(s) {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 3) return false;
  // 至少含 1 个空格（多词）或 1 个英文字母序列长于 3
  if (!/\s/.test(t) && !/[A-Za-z]{4,}/.test(t)) return false;
  // 排除纯标识符样式
  if (/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(t)) return false;
  // 排除 SLF4J 模板（只有占位符）
  if (/^[\s{}]*$/.test(t.replace(/[A-Za-z]/g, ''))) return false;
  // 至少含一个空格或句号/问号/冒号
  if (!/[\s.?!:,]/.test(t)) return false;
  if (isAlreadyChinese(t)) return false;
  return true;
}

async function processJava(file, strings, ctx) {
  const rel = path.relative(ctx.repoRoot, file);
  const src = await fs.readFile(file, 'utf8');

  const collect = (rx, kindFn) => {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(src)) !== null) {
      const raw = m[m.length - 1];
      const text = normalize(unescapeJavaString(raw));
      if (!looksLikeUserText(text)) continue;
      const upTo = src.slice(0, m.index);
      const line = (upTo.match(/\n/g) || []).length + 1;
      const key = stableHash(text);
      let entry = strings.get(key);
      if (!entry) {
        entry = { id: key, source: text, occurrences: [] };
        strings.set(key, entry);
      }
      entry.occurrences.push({ file: rel, line, kind: kindFn(m) });
    }
  };

  collect(throwRegex, (m) => `throw:${m[0].match(/new\s+(\w+)/)[1]}`);
  collect(factoryCreateRegex, (m) => `factory:${m[1]}`);
  collect(apiAnnotationsRegex, () => 'swagger');
  collect(shortApiOpRegex, () => 'swagger:short');
}

async function main() {
  const ctx = await loadConfig();
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

  console.log(`[extract-be] scanning ${javaFiles.length} Java files...`);

  const strings = new Map();
  for (const f of javaFiles) {
    await processJava(f, strings, ctx);
  }

  // FreeMarker
  const ftlGlobs = ctx.config.paths.backend.freemarker || [];
  const ftlFiles = [];
  for (const pat of ftlGlobs) {
    const found = await glob(pat, {
      cwd: ctx.repoRoot,
      absolute: true,
      nodir: true,
    });
    ftlFiles.push(...found);
  }
  const ftlList = [];
  for (const f of ftlFiles) {
    const rel = path.relative(ctx.repoRoot, f);
    const src = await fs.readFile(f, 'utf8');
    const hasEnglish = /[A-Za-z]{4,}/.test(src) && !isAlreadyChinese(src);
    ftlList.push({ file: rel, bytes: src.length, hasEnglishText: hasEnglish });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalJavaFiles: javaFiles.length,
    totalUnique: strings.size,
    totalOccurrences: Array.from(strings.values()).reduce((acc, e) => acc + e.occurrences.length, 0),
    strings: Array.from(strings.values()).sort((a, b) => a.source.localeCompare(b.source)),
  };

  const outPath = path.join(ctx.repoRoot, 'i18n', 'strings-backend.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));

  const ftlOutPath = path.join(ctx.repoRoot, 'i18n', 'ftl-files.json');
  await fs.writeFile(
    ftlOutPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: ftlList.length,
        withEnglish: ftlList.filter((x) => x.hasEnglishText).length,
        files: ftlList,
      },
      null,
      2,
    ),
  );

  console.log(`[extract-be] done`);
  console.log(`  java files          : ${javaFiles.length}`);
  console.log(`  unique strings      : ${output.totalUnique}`);
  console.log(`  occurrences         : ${output.totalOccurrences}`);
  console.log(`  ftl files           : ${ftlList.length}`);
  console.log(`  ftl with english    : ${ftlList.filter((x) => x.hasEnglishText).length}`);
  console.log(`  outputs             : i18n/strings-backend.json, i18n/ftl-files.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
