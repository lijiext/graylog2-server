#!/usr/bin/env node
/**
 * FreeMarker 模板翻译：按文件整体翻译，保留所有 FTL 指令和变量。
 *
 * 用法：
 *   node translate-ftl.mjs              # 全量翻译 i18n/ftl-files.json 列出的文件
 *   node translate-ftl.mjs --dry-run    # 只打印预览
 *   node translate-ftl.mjs --limit 3    # 只处理前 N 个文件
 *
 * Provider 选择（和 translate.mjs 一致）：
 *   I18N_PROVIDER=gemini (默认) | qwen
 *   QWEN_BASE_URL / QWEN_MODEL / QWEN_API_KEY
 *   I18N_CONCURRENCY=8 （Qwen 并发度，gemini 始终为 1）
 *
 * 输出：直接覆盖原 ftl 文件，同时把备份写到 i18n/ftl-backup/<相对路径>
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { loadConfig } from './lib/config.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripFences(s) {
  let out = s.trim();
  // 剥离 ```ftl / ```html / ``` 围栏
  out = out.replace(/^```[a-zA-Z]*\s*\n?/, '');
  out = out.replace(/\n?```\s*$/, '');
  return out;
}

function runGemini(binary, model, prompt, timeoutMs) {
  return new Promise((resolve, reject) => {
    const childArgs = ['-p', prompt, '-o', 'text'];
    if (model && model.trim()) childArgs.push('-m', model.trim());
    const child = spawn(binary, childArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });
    let stdout = '';
    let stderr = '';
    let killed = false;
    const killGroup = () => {
      killed = true;
      try { process.kill(-child.pid, 'SIGKILL'); }
      catch { try { child.kill('SIGKILL'); } catch {} }
    };
    const timer = setTimeout(() => {
      killGroup();
      reject(new Error(`gemini timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (killed) return;
      if (code !== 0) return reject(new Error(`gemini exit ${code}: ${stderr.slice(0, 200)}`));
      resolve(stdout);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function runOpenAICompat({ baseUrl, apiKey, model, systemPrompt, userPrompt, timeoutMs }) {
  const effectiveTimeout = Math.min(timeoutMs, 90000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('client abort (stuck)')), effectiveTimeout);
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Connection': 'close',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.0,
        max_tokens: 32768,
        enable_thinking: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: controller.signal,
      keepalive: false,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`http ${res.status}: ${body.slice(0, 200)}`);
    }
    const obj = await res.json();
    const msg = obj.choices?.[0]?.message;
    const content = msg?.content || '';
    const finish = obj.choices?.[0]?.finish_reason;
    if (finish && finish !== 'stop') {
      throw new Error(`finish_reason=${finish} (likely truncated)`);
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

function buildSystemPrompt(basePrompt) {
  return `${basePrompt}

## Task
You are translating a FreeMarker template file used by Graylog for user-facing notification messages.

## Hard rules
1. OUTPUT the translated FreeMarker template content ONLY. No prose, no explanations, no markdown code fences.
2. DO NOT modify any FreeMarker directives: \`<#if ...>\`, \`</#if>\`, \`<#else>\`, \`<#elseif ...>\`, \`<#list ...>\`, \`<#assign ...>\`, \`<#include ...>\`, \`<#macro ...>\`, \`<#return>\`, etc. Keep them verbatim.
3. DO NOT change variable references: \`\${var}\`, \`\${var.name}\`, \`\${var?has_content}\` — keep them exactly as written.
4. DO NOT alter URLs, file paths, code identifiers, or HTML tags/attributes.
5. Preserve ALL whitespace, blank lines, and indentation exactly.
6. Only translate the natural-English text (sentences/paragraphs) into Simplified Chinese.
7. Follow the Graylog terminology glossary (Stream=数据流, Pipeline=处理管道, Dashboard=仪表盘, Alert=告警, Node=节点, Index=索引, Retention=保留策略, etc.).
8. Keep short proper nouns in English: Graylog, Elasticsearch, OpenSearch, MongoDB, Kafka, Docker, HTTP, URL, API, GC, JVM, etc.
9. If a line has NO translatable English (only directives / variables / punctuation), echo it unchanged.`;
}

function buildUserPrompt(fileName, content) {
  return `## File: ${fileName}

## Source content

${content}

## Output (translated content only, no fences, no prose)`;
}

async function main() {
  const ctx = await loadConfig();
  const cfg = ctx.config.gemini;
  const timeoutMs = cfg.timeoutMs || 300000;

  const provider = (process.env.I18N_PROVIDER || 'gemini').toLowerCase();
  const qwen = {
    baseUrl: process.env.QWEN_BASE_URL || '',
    model: process.env.QWEN_MODEL || 'Qwen3.5',
    apiKey: process.env.QWEN_API_KEY || '',
  };
  if (provider === 'qwen' && (!qwen.baseUrl || !qwen.apiKey)) {
    console.error('I18N_PROVIDER=qwen but QWEN_BASE_URL / QWEN_API_KEY missing');
    process.exit(1);
  }
  const concurrency = provider === 'qwen'
    ? parseInt(process.env.I18N_CONCURRENCY || '4', 10)
    : 1;

  const ftlDoc = JSON.parse(
    await fs.readFile(path.join(ctx.repoRoot, 'i18n', 'ftl-files.json'), 'utf8'),
  );
  const baseSystemPrompt = await fs.readFile(
    path.join(ctx.repoRoot, cfg.systemPromptFile),
    'utf8',
  );
  const systemPrompt = buildSystemPrompt(baseSystemPrompt);

  const targets = ftlDoc.files.filter((f) => f.hasEnglishText).slice(0, limit);
  console.log(`[ftl] provider    : ${provider}${provider === 'qwen' ? ` (${qwen.model})` : ''}`);
  console.log(`[ftl] concurrency : ${concurrency}`);
  console.log(`[ftl] files to translate: ${targets.length} (of ${ftlDoc.total})`);
  console.log(`[ftl] dry-run     : ${dryRun}`);

  const backupDir = path.join(ctx.repoRoot, 'i18n', 'ftl-backup');
  await fs.mkdir(backupDir, { recursive: true });

  const failures = [];
  let processedCount = 0;
  let successCount = 0;

  async function translateOne(item) {
    const abs = path.join(ctx.repoRoot, item.file);
    const src = await fs.readFile(abs, 'utf8');
    const t0 = Date.now();
    // 已翻译过则跳过（基本启发：ASCII 字母少于 20% 且存在中文）
    const chineseRe = /[\u4e00-\u9fff]/;
    if (chineseRe.test(src)) {
      const asciiLetters = (src.match(/[A-Za-z]/g) || []).length;
      if (asciiLetters < src.length * 0.25) {
        console.log(`[ftl skip] ${item.file} (already Chinese)`);
        return { skip: true };
      }
    }

    const userPrompt = buildUserPrompt(item.file, src);

    let attempt = 0;
    let result = null;
    let lastErr = null;
    while (attempt < cfg.retries) {
      attempt += 1;
      try {
        let raw;
        if (provider === 'qwen') {
          raw = await runOpenAICompat({
            baseUrl: qwen.baseUrl,
            apiKey: qwen.apiKey,
            model: qwen.model,
            systemPrompt,
            userPrompt,
            timeoutMs,
          });
        } else {
          raw = await runGemini(cfg.binary, cfg.model, `${systemPrompt}\n\n${userPrompt}`, timeoutMs);
        }
        result = stripFences(raw);
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`  [${item.file}] attempt ${attempt} failed: ${e.message}`);
        if (attempt < cfg.retries) await sleep(cfg.backoffMs * attempt);
      }
    }

    if (!result) {
      failures.push({ file: item.file, error: lastErr?.message || 'unknown' });
      return { skip: false, ok: false };
    }

    // 基本校验：必须保留原有 FTL 指令
    const origDirectives = (src.match(/<#[a-zA-Z]+/g) || []).sort();
    const newDirectives = (result.match(/<#[a-zA-Z]+/g) || []).sort();
    if (origDirectives.join('|') !== newDirectives.join('|')) {
      console.warn(
        `  [${item.file}] WARN directives mismatch: orig=${origDirectives.length} new=${newDirectives.length}, skipping write`,
      );
      failures.push({ file: item.file, error: 'directive mismatch' });
      return { skip: false, ok: false };
    }

    // 变量引用校验
    const origVars = (src.match(/\$\{[^}]+\}/g) || []).sort();
    const newVars = (result.match(/\$\{[^}]+\}/g) || []).sort();
    if (origVars.join('|') !== newVars.join('|')) {
      console.warn(
        `  [${item.file}] WARN variable mismatch: orig=${origVars.length} new=${newVars.length}, skipping write`,
      );
      failures.push({ file: item.file, error: 'variable mismatch' });
      return { skip: false, ok: false };
    }

    if (!dryRun) {
      const backupAbs = path.join(backupDir, item.file);
      await fs.mkdir(path.dirname(backupAbs), { recursive: true });
      await fs.writeFile(backupAbs, src);
      await fs.writeFile(abs, result.endsWith('\n') ? result : `${result}\n`);
    }
    console.log(`  [${item.file}] done in ${Date.now() - t0}ms (${src.length}→${result.length}B)`);
    return { skip: false, ok: true };
  }

  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async (_, wid) => {
    while (cursor < targets.length) {
      const idx = cursor++;
      const item = targets[idx];
      processedCount += 1;
      console.log(`[ftl ${processedCount}/${targets.length} w${wid}] ${item.file}`);
      const r = await translateOne(item);
      if (r.ok) successCount += 1;
    }
  });
  await Promise.all(workers);

  console.log(`\n[ftl] done`);
  console.log(`  processed : ${processedCount}`);
  console.log(`  success   : ${successCount}`);
  console.log(`  failures  : ${failures.length}`);
  if (failures.length) {
    console.log(`  failed files:`);
    failures.forEach((f) => console.log(`    ${f.file}: ${f.error}`));
  }
  if (dryRun) console.log(`  (dry-run: no files written)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
