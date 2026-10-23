#!/usr/bin/env node
'use strict';

/**
 * iteracompute-bulk-apikey CLI — mint IteraCompute accounts, one API key each.
 *
 * The panel hands out a real free tier (`qwen/qwen3.8-27b` at $0 per token, up to
 * 30M tokens/month per account, no card), but sign-up sits behind a mandatory
 * Cloudflare **Turnstile** widget, so this tool drives a real Chrome over CDP for
 * exactly one step (the challenge) and does everything else — mailbox, register,
 * verify, login, key, chat gate — over plain HTTPS, optionally through your exit.
 *
 *   node public-cli.js --count 5 --pool proxies.txt
 *   node public-cli.js --verify-only
 *   node public-cli.js --screen
 *   node public-cli.js --connect-9router
 *
 * Flow per account (serial by design — the challenge needs one visible window):
 *   temp.tf mailbox -> /sign-up -> Turnstile (action=register, cData=nonce)
 *   -> POST /api/control/v1/auth/register -> confirmation mail (verify LINK)
 *   -> POST /api/control/v1/auth/verify-email {token} -> POST /api/control/v1/auth/login
 *   -> POST /api/control/v1/api-keys {display_name} -> chat-200 gate -> keys.txt
 *
 * A key is written to keys.txt only after /v1/chat/completions answers 200 with
 * non-empty content or reasoning content.
 *
 * Proxy is optional: without a pool the tool says so and connects directly.
 *
 * Requirements: Node 18+ (global WebSocket) and Google Chrome installed (the
 * captcha step only). No npm dependencies.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// The browser/captcha rail plus the zero-dep HTTPS transport it polls Chrome
// through — see src/solver.js.
const {
  arg, has, sleep, log, SITE, HEADLESS, parseProxy, exitJson, CDP, launchChrome, solveTurnstile,
} = require('./solver.js');

const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.jsonl');
const OUT_DIR = path.join(ROOT, 'out');
const DEAD_FILE = path.join(ROOT, 'keys-dead.txt');
/** Dead keys from the last verify run (one `key<TAB># reason` per line). */
const writeDead = (dead) => fs.writeFileSync(DEAD_FILE, dead.map((d) => `${d.key}\t# ${d.why}`).join('\n') + (dead.length ? '\n' : ''));

const API_BASE = 'https://api.iteracompute.com/v1';
const TEMPTF = 'https://temp.tf';

// ------------------------------------------------------------------- options

if (has('help') || has('h')) {
  console.log(`
iteracompute-bulk-apikey — IteraCompute (platform.iteracompute.com) free-tier key mint

  node public-cli.js --count N            mint N accounts (default 5), one key each
  node public-cli.js --verify-only        re-run the gate on every key in keys.txt
  node public-cli.js --screen             self-test the exit pool
  node public-cli.js --connect-9router    register keys with a local 9Router

Options
  --pool FILE     exit list, one proxy per line (default proxies.txt, env ITERACOMPUTE_PROXIES)
  --model ID      model used for the chat gate (default qwen/qwen3.8-27b)
  --headless      run the captcha browser headless (Turnstile answers error 600* — not recommended)
  --chrome PATH   Chrome binary
  --gap MS        pause between accounts (default 3000)
  --tries N       attempts per account (default 2)
  --timeout MS    per-request timeout (default 60000)
  --help
`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '5'), 10) || 5);
const MODEL = arg('model', 'qwen/qwen3.8-27b');
const ALT_MODELS = arg('alt-models', 'moonshotai/kimi-k3-free').split(',').map((s) => s.trim()).filter(Boolean);
const GAP_MS = Math.max(0, parseInt(arg('gap', '3000'), 10) || 0);
const TRIES = Math.max(1, parseInt(arg('tries', '2'), 10) || 2);
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const CONNECT_ROUTER = has('connect-9router');

fs.mkdirSync(OUT_DIR, { recursive: true });
const randPass = () => `Ic${crypto.randomBytes(6).toString('base64url')}9a`;

// ------------------------------------------------------------------- pool
function loadExits() {
  const file = arg('pool', process.env.ITERACOMPUTE_PROXIES || 'proxies.txt');
  let text = '';
  try { text = fs.readFileSync(path.resolve(ROOT, file), 'utf8'); } catch { return null; }
  const list = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map(parseProxy).filter(Boolean);
  return list.length ? list : null;
}

async function screen(exits) {
  const live = [];
  for (const p of exits) {
    const t0 = Date.now();
    try {
      const r = await exitJson(p, `${SITE}/sign-up`, { timeoutMs: 15000 });
      const ok = r.status === 200;
      log(`  ${ok ? 'live ' : 'dead '} ${p.line} ${ok ? r.status : r.status || 'ERR'} ${Date.now() - t0}ms`);
      if (ok) live.push(p);
    } catch (e) {
      log(`  dead  ${p.line} ${e.message}`);
    }
  }
  return live;
}

// ------------------------------------------------------------------- mail
/** Fresh temp.tf Microsoft-family mailbox (outlook/hotmail plus-alias). */
async function newMailbox(proxy) {
  const q = new URLSearchParams({ providers: 'outlook,hotmail', dot: '0', plus: '1' }).toString();
  const r = await exitJson(proxy, `${TEMPTF}/api/account?${q}`, { timeoutMs: 30000 });
  const address = String((r.json && r.json.email) || '').trim();
  if (!/@/.test(address)) throw new Error(`temp.tf: no address (${r.status} ${r.text.slice(0, 120)})`);
  return address;
}

async function waitVerifyLink(proxy, address, { timeoutMs = 300000, pollMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  const seen = new Set();
  while (Date.now() < deadline) {
    let list = [];
    try {
      const r = await exitJson(proxy, `${TEMPTF}/api/check`, { method: 'POST', body: { email: address, wait: false }, timeoutMs: 30000 });
      list = Array.isArray(r.json) ? r.json : (r.json && (r.json.data || r.json.messages)) || [];
    } catch (e) { log('   mailbox poll:', e.message); }
    for (const m of list) {
      const id = String(m.id || m.messageId || '');
      if (seen.has(id)) continue;
      seen.add(id);
      const from = String(m.from || m.sender || '');
      const subject = String(m.subject || '');
      if (!/iteracompute|auth\.iteracompute/i.test(from + ' ' + subject)) continue;
      const blob = [m.html, m.htmlBody, m.text, m.body, m.plain, m.snippet].filter(Boolean).map(String).join(' ');
      const urls = [...blob.matchAll(/https?:\/\/[^\s"'<>)]+/g)].map((x) => x[0].replace(/&amp;/g, '&').replace(/[.,)]+$/, ''));
      const link = urls.find((h) => /\/verify-email\?token=/.test(h));
      if (!link) continue;
      return { id, from, subject, link, token: new URL(link).searchParams.get('token') };
    }
    await sleep(pollMs);
  }
  throw new Error('no confirmation mail');
}

/** Page-context control-plane call (same-origin cookies + CSRF when present). */
function apiCallExpr(pathname, body) {
  return `(async () => {
    try { await (window.iteraAttribution && window.iteraAttribution.ready); } catch (e) {}
    const c = document.cookie.split('; ').find((x) => /iteracompute_csrf=/.test(x));
    const headers = { accept: 'application/json' };
    if (c) headers['X-CSRF-Token'] = decodeURIComponent(c.split('=').slice(1).join('='));
    const opt = { method: 'POST', headers, credentials: 'same-origin' };
    const payload = ${JSON.stringify(body)};
    if (payload) { headers['content-type'] = 'application/json'; opt.body = JSON.stringify(payload); }
    const r = await fetch('/api/control${pathname}', opt);
    return JSON.stringify({ status: r.status, body: (await r.text()).slice(0, 900) });
  })()`;
}

// ------------------------------------------------------------------- flows
function readKeys() {
  try { return fs.readFileSync(KEYS_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean); } catch { return []; }
}
function appendKey(key) {
  const pre = fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '' : '';
  fs.appendFileSync(KEYS_FILE, pre + key + '\n');
}
function recordAccount(rec) { fs.appendFileSync(ACCOUNTS_FILE, JSON.stringify(rec) + '\n'); }

/** chat-200 gate: 200 AND non-empty content || reasoning content. */
async function chatGate(proxy, key, model = MODEL) {
  const r = await exitJson(proxy, `${API_BASE}/chat/completions`, {
    method: 'POST',
    timeoutMs: 180000,
    headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
    body: { model, messages: [{ role: 'user', content: 'Reply with exactly: Hello!' }], max_tokens: 256, reasoning: false },
  });
  const msg = (r.json && r.json.choices && r.json.choices[0] && r.json.choices[0].message) || {};
  const content = String(msg.content || '');
  const reasoning = String(msg.reasoning_content || msg.reasoning || '');
  return { status: r.status, content: content.slice(0, 200), reasoning: reasoning.slice(0, 120), usage: (r.json && r.json.usage) || null, error: r.json && r.json.error || null, gate: r.status === 200 && (content.trim() || reasoning.trim()) ? 'PASS' : 'FAIL' };
}

async function listModels(proxy, key) {
  const r = await exitJson(proxy, `${API_BASE}/models`, { headers: certHeaders(key) });
  return { status: r.status, count: r.json && r.json.data ? r.json.data.length : 0 };
}
function certHeaders(key) { return key ? { authorization: `Bearer ${key}` } : {}; }

/** One full account: mailbox -> turnstile -> register -> verify -> login -> key. */
async function mintOne(cdp, proxy, n) {
  const email = await newMailbox(proxy);
  const password = randPass();
  const ctx = await cdp.send('Target.createBrowserContext', { proxyServer: proxy ? `${proxy.protocol === 'socks5' ? 'socks5' : 'http'}://${proxy.host}:${proxy.port}` : undefined, disposeOnDetach: false });
  const tab = await solveTurnstile(cdp, ctx, proxy, {});
  try {
    if (!tab.token) throw new Error(`turnstile unsolved (err=${tab.err || 'none'}); a visible, focused window is required`);
    const reg = JSON.parse(await tab.evalIn(apiCallExpr('/v1/auth/register', { email, password, accepted_terms: true, turnstile_token: tab.token }), true));
    if (reg.status >= 300) throw new Error(`register ${reg.status}: ${reg.body.slice(0, 120)}`);
    const mail = await waitVerifyLink(proxy, email, {});
    const ver = JSON.parse(await tab.evalIn(apiCallExpr('/v1/auth/verify-email', { token: mail.token }), true));
    if (ver.status >= 300) throw new Error(`verify ${ver.status}: ${ver.body.slice(0, 120)}`);
    const login = JSON.parse(await tab.evalIn(apiCallExpr('/v1/auth/login', { email, password }), true));
    if (login.status >= 300) throw new Error(`login ${login.status}: ${login.body.slice(0, 120)}`);
    const created = JSON.parse(await tab.evalIn(apiCallExpr('/v1/api-keys', { display_name: `itera-${n}` }), true));
    if (created.status >= 300) throw new Error(`key ${created.status}: ${created.body.slice(0, 120)}`);
    const m = created.body.match(/"(?:key|secret|api_key|token|value)"\s*:\s*"([^"]{20,})"/i);
    if (!m) throw new Error('no key in create response');
    return { email, password, key: m[1], mail: { id: mail.id, subject: mail.subject }, register: reg.status, verify: ver.status, login: login.status };
  } finally {
    try { await cdp.send('Target.closeTarget', { targetId: tab.targetId }); } catch {}
    try { await cdp.send('Target.disposeBrowserContext', { browserContextId: ctx.browserContextId }); } catch {}
  }
}

async function mint(exits) {
  const mode = exits ? `pool of ${exits.length}` : 'NO proxy (direct)';
  log(`mint ${COUNT} account(s) · model ${MODEL} · ${mode}`);
  if (!exits) log('WARNING: running WITHOUT a proxy — the panel sees this machine directly.');
  const key = exits ? exits[0] : null;
  const port = 9300 + Math.floor(Math.random() * 300);
  const chrome = await launchChrome(port);
  const cdp = await new CDP(chrome.wsUrl).connect();
  log(`  chrome cdp ready (${HEADLESS ? 'headless — Turnstile may answer 600*' : 'visible window'})`);
  let ok = 0;
  try {
    for (let n = readKeys().length + 1; n < readKeys().length + 1 + COUNT; n++) {
      let last = null;
      for (let t = 1; t <= TRIES; t++) {
        try {
          const rec = await mintOne(cdp, key, n);
          const gate = await chatGate(key, rec.key);
          log(`  #${n} ${rec.email} -> key ${rec.key.slice(0, 10)}… gate=${gate.gate} (${gate.status})`);
          if (gate.gate !== 'PASS') { last = new Error('chat gate ' + gate.gate); break; }
          appendKey(rec.key);
          recordAccount({ provider: 'iteracompute', host: 'platform.iteracompute.com', ...rec, model: MODEL, base_url: API_BASE, exit: key ? key.line : null, chat200: { status: gate.status, content: gate.content, total_tokens: gate.usage && gate.usage.total_tokens, at: new Date().toISOString() } });
          ok++;
          last = null;
          break;
        } catch (e) {
          last = e;
          log(`  #${n} retry ${t}/${TRIES}: ${e.message}`);
          await sleep(3000);
        }
      }
      if (last) log(`  #${n} FAILED: ${last.message}`);
      await sleep(GAP_MS);
    }
  } finally {
    try { cdp.close(); } catch {}
    try { if (!HEADLESS) process.kill(-chrome.child.pid) || chrome.child.kill(); } catch { try { chrome.child.kill(); } catch {} }
  }
  log(`done: ${ok}/${COUNT} keys minted and chat-verified -> ${KEYS_FILE}`);
}

async function verifyOnly(exits) {
  const keys = readKeys();
  if (!keys.length) { log('keys.txt is empty — nothing to verify'); return; }
  const key = exits ? exits[0] : null;
  log(`verify ${keys.length} key(s)${key ? ` through ${key.line}` : ' (direct)'}`);
  let pass = 0;
  const dead = [];
  for (const k of keys) {
    const models = await listModels(key, k).catch((e) => ({ status: 0, error: e.message }));
    const gate = await chatGate(key, k).catch((e) => ({ status: 0, gate: 'FAIL', error: e.message }));
    if (gate.gate === 'PASS') pass++;
    else dead.push({ key: k, why: `chat ${gate.status}` });
    log(`  ${k.slice(0, 10)}… models=${models.status} chat=${gate.status} ${gate.gate}${gate.error ? ' ' + JSON.stringify(gate.error).slice(0, 80) : ''}`);
  }
  writeDead(dead);
  log(`verified ${pass}/${keys.length} (${MODEL})`);
}

/** Register keys.txt with a local 9Router. */
async function connectRouter() {
  const base = arg('base', process.env.ITERACOMPUTE_ROUTER || 'http://localhost:20128');
  const password = arg('password', process.env.ITERACOMPUTE_ROUTER_PASSWORD || '');
  const keys = readKeys();
  if (!keys.length) { log('keys.txt is empty'); return; }
  log(`9Router ${base} · ${keys.length} key(s) · prefix ${arg('prefix', 'iteracompute')}`);
  const body = { name: arg('name', 'IteraCompute'), prefix: arg('prefix', 'iteracompute'), baseUrl: API_BASE, model: MODEL, keys };
  if (password) body.password = password;
  const r = await exitJson(null, `${base}/api/providers`, { method: 'POST', body });
  log(`  router answered ${r.status} ${r.text.slice(0, 200)}`);
}

const exits = loadExits();
const entry = SCREEN ? Promise.resolve().then(async () => {
  if (!exits) { log('no proxy pool found — nothing to screen'); return; }
  const live = await screen(exits);
  fs.writeFileSync(path.join(OUT_DIR, 'exits-live.txt'), live.map((p) => p.line).join('\n') + '\n');
  log(`live exits: ${live.length}/${exits.length} -> out/exits-live.txt`);
}) : VERIFY_ONLY ? verifyOnly(exits) : CONNECT_ROUTER ? connectRouter() : mint(exits);

entry.catch((e) => { console.error('[fatal]', e.message); process.exit(1); });
