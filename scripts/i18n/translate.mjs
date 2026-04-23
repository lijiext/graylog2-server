#!/usr/bin/env node
/**
 * Gemini 批量翻译：读 i18n/strings.json → 产出 i18n/translations.json
 *
 * 用法：
 *   node translate.mjs                # 只翻译未翻译的（增量）
 *   node translate.mjs --retranslate  # 强制重译全部
 *   node translate.mjs --limit 100    # 只处理前 N 条（调试用）
 *   node translate.mjs --dry-run      # 不调用 gemini，仅打印批次
 *
 * 依赖：本机已安装 gemini CLI（oauth-personal 登录）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { loadConfig, isAlreadyChinese } from './lib/config.mjs';

const args = process.argv.slice(2);
const retranslate = args.includes('--retranslate');
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const inputIdx = args.indexOf('--input');
const outputIdx = args.indexOf('--output');
const inputOverride = inputIdx >= 0 ? args[inputIdx + 1] : null;
const outputOverride = outputIdx >= 0 ? args[outputIdx + 1] : null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripMarkdownFences(s) {
  let out = s.trim();
  out = out.replace(/^```(?:json|javascript)?\s*/i, '');
  out = out.replace(/\s*```\s*$/, '');
  return out.trim();
}

function tryParseJson(text) {
  const candidates = [text];
  candidates.push(stripMarkdownFences(text));
  // 从第一个 { 到最后一个 }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) candidates.push(text.slice(first, last + 1));
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {}
  }
  return null;
}

function runGemini(binary, model, prompt, timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    const childArgs = ['-p', prompt, '-o', 'text'];
    if (model && model.trim()) {
      childArgs.push('-m', model.trim());
    }
    // detached:true 使 child 成为新进程组领导，便于杀死整组（包括 gemini 自己再 fork 的 node 进程）
    const child = spawn(binary, childArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });
    let stdout = '';
    let stderr = '';
    let killed = false;
    const killGroup = () => {
      killed = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        try { child.kill('SIGKILL'); } catch {}
      }
    };
    const timer = setTimeout(() => {
      killGroup();
      reject(new Error(`gemini timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
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
  // Qwen 自部署响应应在 5s 内，卡超 45s 一定是连接问题 → 主动 abort 重试
  const effectiveTimeout = Math.min(timeoutMs, 45000);
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

async function translateBatch({ provider, binary, model, systemPrompt, sources, qwen }) {
  const payload = JSON.stringify(sources);
  const userPrompt = `## Input\nTranslate each of these English UI strings into Simplified Chinese. Output strict JSON object mapping the EXACT input string to its translation (preserve every character: punctuation, placeholders like \${var}, newlines, leading/trailing spaces).\n\nInputs:\n${payload}\n\n## Output\nOnly the JSON object, no markdown, no prose.`;
  const timeoutMs = globalThis.__geminiTimeoutMs || 300000;
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
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    raw = await runGemini(binary, model, prompt, timeoutMs);
  }
  const obj = tryParseJson(raw);
  if (!obj || typeof obj !== 'object') {
    throw new Error(`unparseable response: ${raw.slice(0, 200)}`);
  }
  return obj;
}

async function main() {
  const ctx = await loadConfig();
  const cfg = ctx.config.gemini;
  globalThis.__geminiTimeoutMs = cfg.timeoutMs || 300000;

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

  const stringsPath = path.join(ctx.repoRoot, inputOverride || ctx.config.output.strings);
  const transPath = path.join(ctx.repoRoot, outputOverride || ctx.config.output.translations);
  const systemPromptPath = path.join(ctx.repoRoot, cfg.systemPromptFile);

  const stringsDoc = JSON.parse(await fs.readFile(stringsPath, 'utf8'));
  const systemPrompt = await fs.readFile(systemPromptPath, 'utf8');

  let existing = { generatedAt: '', translations: {} };
  try {
    existing = JSON.parse(await fs.readFile(transPath, 'utf8'));
  } catch {}

  const todo = [];
  for (const entry of stringsDoc.strings) {
    const src = entry.source;
    if (!retranslate && existing.translations[src]) continue;
    todo.push(src);
    if (todo.length >= limit) break;
  }

  console.log(`[translate] provider     : ${provider}${provider === 'qwen' ? ` (${qwen.model})` : ` (${cfg.model || 'default'})`}`);
  console.log(`[translate] total unique : ${stringsDoc.strings.length}`);
  console.log(`[translate] already cached: ${Object.keys(existing.translations).length}`);
  console.log(`[translate] to translate : ${todo.length}`);
  console.log(`[translate] batch size   : ${cfg.batchSize}`);
  console.log(`[translate] rate limit   : ${cfg.rateLimitRpm} RPM`);
  if (dryRun) console.log(`[translate] (dry-run) no API calls`);

  const concurrency = parseInt(process.env.I18N_CONCURRENCY || '1', 10);
  const merged = { ...existing.translations };
  const failures = [];
  let translated = 0;
  let completedBatches = 0;

  // 拆分 batches
  const batchList = [];
  for (let i = 0; i < todo.length; i += cfg.batchSize) {
    batchList.push({ idx: batchList.length + 1, items: todo.slice(i, i + cfg.batchSize), offset: i });
  }
  const totalBatches = batchList.length;
  console.log(`[translate] concurrency  : ${concurrency}`);
  console.log(`[translate] total batches: ${totalBatches}`);

  // 写盘串行化
  let writing = Promise.resolve();
  const persist = () => {
    writing = writing.then(() =>
      fs.writeFile(
        transPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            model: provider === 'qwen' ? qwen.model : cfg.model,
            totalTranslated: Object.keys(merged).length,
            failures,
            translations: merged,
          },
          null,
          2,
        ),
      ),
    );
    return writing;
  };

  async function processBatch(b) {
    const t0 = Date.now();
    if (dryRun) {
      console.log(`[batch ${b.idx}/${totalBatches}] items ${b.offset}..${b.offset + b.items.length - 1} (dry)`);
      return;
    }
    let attempt = 0;
    let result = null;
    let lastErr = null;
    while (attempt < cfg.retries) {
      attempt += 1;
      try {
        result = await translateBatch({
          provider,
          binary: cfg.binary,
          model: cfg.model,
          systemPrompt,
          sources: b.items,
          qwen,
        });
        break;
      } catch (e) {
        lastErr = e;
        if (attempt < cfg.retries) await sleep(cfg.backoffMs * attempt);
      }
    }

    if (!result) {
      console.warn(`[batch ${b.idx}] gave up after ${cfg.retries}: ${lastErr?.message?.slice(0, 120)}`);
      b.items.forEach((s) => failures.push({ source: s, error: lastErr?.message || 'unknown' }));
    } else {
      let hit = 0;
      for (const src of b.items) {
        const trans = result[src];
        if (typeof trans === 'string' && trans.length > 0) {
          if (!isAlreadyChinese(trans) && trans === src) {
            merged[src] = src;
          } else {
            merged[src] = trans;
          }
          hit += 1;
          translated += 1;
        } else {
          failures.push({ source: src, error: 'missing in response' });
        }
      }
      completedBatches += 1;
      console.log(`[batch ${b.idx}/${totalBatches}] ${hit}/${b.items.length} in ${Date.now() - t0}ms (done ${completedBatches}/${totalBatches}, cached ${Object.keys(merged).length})`);
      persist();
    }
  }

  // concurrency pool
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < batchList.length) {
      const b = batchList[cursor++];
      await processBatch(b);
    }
  });
  await Promise.all(workers);
  await writing;

  console.log(`\n[translate] done`);
  console.log(`  batches      : ${completedBatches}/${totalBatches}`);
  console.log(`  translated   : ${translated}`);
  console.log(`  total cached : ${Object.keys(merged).length}`);
  console.log(`  failures     : ${failures.length}`);
  console.log(`  output       : ${ctx.config.output.translations}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
