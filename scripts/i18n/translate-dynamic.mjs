#!/usr/bin/env node
/**
 * 动态模板字面量翻译：strings-dynamic.json → translations-dynamic.json
 *
 * 与 translate.mjs 同源，只是输入输出位置不同，且 prompt 强调保留 {N} 占位符。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, isAlreadyChinese } from './lib/config.mjs';

const args = process.argv.slice(2);
const retranslate = args.includes('--retranslate');
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function stripFences(s) {
  let o = s.trim();
  o = o.replace(/^```(?:json|javascript)?\s*/i, '');
  o = o.replace(/\s*```\s*$/, '');
  return o.trim();
}

function tryParseJson(text) {
  const cand = [text, stripFences(text)];
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a >= 0 && b > a) cand.push(text.slice(a, b + 1));
  for (const c of cand) {
    try { return JSON.parse(c); } catch {}
  }
  return null;
}

async function runOpenAICompat({ baseUrl, apiKey, model, systemPrompt, userPrompt, timeoutMs }) {
  const effectiveTimeout = Math.min(timeoutMs, 60000);
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
    const content = obj.choices?.[0]?.message?.content || '';
    const finish = obj.choices?.[0]?.finish_reason;
    if (finish && finish !== 'stop') throw new Error(`finish_reason=${finish} (likely truncated)`);
    return content;
  } finally { clearTimeout(timer); }
}

function validateTranslation(src, zh) {
  if (typeof zh !== 'string' || zh.length === 0) return 'empty';
  // 占位符必须全保留
  const expected = new Set(src.match(/\{\d+\}/g) || []);
  const got = new Set(zh.match(/\{\d+\}/g) || []);
  for (const p of expected) if (!got.has(p)) return `missing placeholder ${p}`;
  for (const p of got) if (!expected.has(p)) return `extra placeholder ${p}`;
  return null;
}

async function main() {
  const ctx = await loadConfig();
  const cfg = ctx.config.gemini;
  const timeoutMs = cfg.timeoutMs || 300000;

  const provider = (process.env.I18N_PROVIDER || 'qwen').toLowerCase();
  if (provider !== 'qwen') {
    console.error('Only qwen provider supported in translate-dynamic');
    process.exit(1);
  }
  const qwen = {
    baseUrl: process.env.QWEN_BASE_URL || '',
    model: process.env.QWEN_MODEL || 'Qwen3.5',
    apiKey: process.env.QWEN_API_KEY || '',
  };
  if (!qwen.baseUrl || !qwen.apiKey) {
    console.error('QWEN_BASE_URL / QWEN_API_KEY missing');
    process.exit(1);
  }

  const systemPrompt = `You are a professional UI translator. Translate English UI strings to Simplified Chinese.

HARD RULES:
1. Preserve placeholder tokens literally: {0}, {1}, {2}, ... Keep the SAME SET of placeholders. You may reorder them if Chinese grammar demands it.
2. Follow the Graylog terminology: Stream=数据流, Pipeline=处理管道, Dashboard=仪表盘, Alert=告警, Node=节点, Index=索引, Index Set=索引集, Retention=保留策略, Widget=小部件, Event=事件, Notification=通知, Query=查询, User=用户, Role=角色, Team=团队, Search=搜索, Filter=过滤器, Input=输入, Output=输出, Extractor=提取器, Lookup Table=查找表, Sidecar=Sidecar, Grok=Grok.
3. Keep proper nouns in English: Graylog, Elasticsearch, OpenSearch, MongoDB, Kafka, Docker, HTTP, URL, API, GC, JVM, Data Node, Forwarder.
4. Output STRICT JSON mapping the EXACT input string to its Chinese translation. No markdown fences, no prose.`;

  const inputPath = path.join(ctx.repoRoot, 'i18n', 'strings-dynamic.json');
  const outputPath = path.join(ctx.repoRoot, 'i18n', 'translations-dynamic.json');

  const inDoc = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  let existing = { translations: {} };
  try { existing = JSON.parse(await fs.readFile(outputPath, 'utf8')); } catch {}

  const todo = [];
  for (const s of inDoc.shapes) {
    if (!retranslate && existing.translations[s.shape]) continue;
    todo.push(s.shape);
    if (todo.length >= limit) break;
  }

  console.log(`[td] total shapes  : ${inDoc.shapes.length}`);
  console.log(`[td] cached         : ${Object.keys(existing.translations).length}`);
  console.log(`[td] to translate   : ${todo.length}`);
  const concurrency = parseInt(process.env.I18N_CONCURRENCY || '8', 10);
  const batchSize = parseInt(process.env.I18N_BATCH_SIZE || String(cfg.batchSize || 10), 10);
  console.log(`[td] concurrency    : ${concurrency}, batch: ${batchSize}`);
  if (dryRun) console.log(`[td] (dry-run)`);

  const merged = { ...existing.translations };
  const failures = [];

  const batchList = [];
  for (let i = 0; i < todo.length; i += batchSize) {
    batchList.push({ idx: batchList.length + 1, items: todo.slice(i, i + batchSize) });
  }

  let writing = Promise.resolve();
  const persist = () => {
    writing = writing.then(() =>
      fs.writeFile(outputPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalTranslated: Object.keys(merged).length,
        failures,
        translations: merged,
      }, null, 2)),
    );
    return writing;
  };

  async function processBatch(b) {
    if (dryRun) {
      console.log(`[td batch ${b.idx}/${batchList.length}] ${b.items.length} items (dry)`);
      return;
    }
    const userPrompt = `Translate each of these English UI strings to Simplified Chinese. Output strict JSON mapping the EXACT input string to its translation.\n\nInputs:\n${JSON.stringify(b.items)}\n\nOutput only the JSON object.`;
    let attempt = 0, result = null, lastErr = null;
    while (attempt < cfg.retries) {
      attempt += 1;
      try {
        const raw = await runOpenAICompat({
          baseUrl: qwen.baseUrl, apiKey: qwen.apiKey, model: qwen.model,
          systemPrompt, userPrompt, timeoutMs,
        });
        result = tryParseJson(raw);
        if (!result) throw new Error(`unparseable: ${raw.slice(0, 120)}`);
        break;
      } catch (e) {
        lastErr = e;
        if (attempt < cfg.retries) await sleep(cfg.backoffMs * attempt);
      }
    }
    if (!result) {
      b.items.forEach((s) => failures.push({ source: s, error: lastErr?.message || 'unknown' }));
      console.warn(`[td batch ${b.idx}] failed: ${lastErr?.message?.slice(0, 100)}`);
      return;
    }
    let hit = 0;
    for (const src of b.items) {
      const zh = result[src];
      const err = validateTranslation(src, zh);
      if (err) { failures.push({ source: src, error: err, got: zh }); continue; }
      merged[src] = zh;
      hit += 1;
    }
    console.log(`[td batch ${b.idx}/${batchList.length}] ${hit}/${b.items.length}`);
    persist();
  }

  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < batchList.length) {
      const b = batchList[cursor++];
      await processBatch(b);
    }
  });
  await Promise.all(workers);
  await writing;

  console.log(`\n[td] done`);
  console.log(`  translated : ${Object.keys(merged).length - Object.keys(existing.translations).length}`);
  console.log(`  total      : ${Object.keys(merged).length}`);
  console.log(`  failures   : ${failures.length}`);
  console.log(`  output     : i18n/translations-dynamic.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
