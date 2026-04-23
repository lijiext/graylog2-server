import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function readYaml(p) {
  return YAML.parse(await fs.readFile(p, 'utf8'));
}

export async function loadConfig() {
  const config = await readYaml(path.join(REPO_ROOT, 'i18n', 'config.yml'));
  const terminology = await readJson(path.join(REPO_ROOT, 'i18n', 'terminology.json'));
  const whitelist = await readJson(path.join(REPO_ROOT, 'i18n', 'whitelist.json'));
  const blacklist = await readJson(path.join(REPO_ROOT, 'i18n', 'blacklist.json'));

  const keepWordsCaseSensitive = new Set(terminology.keep);
  const keepWordsLower = new Set(terminology.keep.map((w) => w.toLowerCase()));

  const whiteAttrs = new Set(whitelist.jsx.attributes);
  const whiteCalls = new Set(whitelist.calls.functions);

  const blackAttrs = new Set(blacklist.attributes.names);
  const blackCallSites = new Set(blacklist.callSites.functions);
  const blackFilePatterns = blacklist.filePatterns;
  const stringRegexes = blacklist.stringPatterns.regex.map((r) => new RegExp(r));
  const minLen = blacklist.stringPatterns.minLengthTranslate ?? 2;

  return {
    raw: { config, terminology, whitelist, blacklist },
    config,
    terminology,
    keepWords: keepWordsCaseSensitive,
    keepWordsLower,
    translateMap: terminology.translate,
    whiteAttrs,
    whiteCalls,
    blackAttrs,
    blackCallSites,
    blackFilePatterns,
    stringRegexes,
    minLen,
    repoRoot: REPO_ROOT,
  };
}

export function isAlreadyChinese(s) {
  return /[\u4e00-\u9fa5]/.test(s);
}

export function normalize(s) {
  return s.replace(/\s+/g, ' ').trim();
}

export function stableHash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function isBlacklistedString(s, ctx) {
  if (!s) return true;
  if (s.length < ctx.minLen) return true;
  if (!/[A-Za-z]/.test(s)) return true;
  if (isAlreadyChinese(s)) return true;
  if (ctx.keepWords.has(s)) return true;
  if (ctx.keepWordsLower.has(s.toLowerCase())) return true;
  if (ctx.stringRegexes.some((r) => r.test(s))) return true;
  return false;
}

export function getCalleeName(node) {
  if (!node) return '';
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression') {
    const o = getCalleeName(node.object);
    const pn = node.property;
    const p = pn.type === 'Identifier' ? pn.name : pn.type === 'StringLiteral' ? pn.value : '';
    return o ? `${o}.${p}` : p;
  }
  return '';
}

export function isUnderBlacklistedCall(nodePath, blackCallSites) {
  let p = nodePath.parentPath;
  while (p) {
    const n = p.node;
    if (n.type === 'CallExpression') {
      const name = getCalleeName(n.callee);
      if (blackCallSites.has(name)) return true;
    }
    if (n.type === 'NewExpression') {
      const name = getCalleeName(n.callee);
      if (blackCallSites.has(`throw new ${name}`) || blackCallSites.has(`new ${name}`)) return true;
    }
    if (n.type === 'ThrowStatement') return true;
    p = p.parentPath;
  }
  return false;
}
