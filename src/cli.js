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
const os = require('os');
const path = require('path');
const net = require('net');
const tls = require('tls');
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.jsonl');
const OUT_DIR = path.join(ROOT, 'out');

const SITE = 'https://platform.iteracompute.com';
const API_BASE = 'https://api.iteracompute.com/v1';
const TEMPTF = 'https://temp.tf';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const CHROME_CANDIDATES = [
  process.env.ITERACOMPUTE_CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt;
}
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name}`);

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
const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
const HEADLESS = has('headless');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const CONNECT_ROUTER = has('connect-9router');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT_DIR, { recursive: true });
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const randPass = () => `Ic${crypto.randomBytes(6).toString('base64url')}9a`;

// ------------------------------------------------------------------- proxy
function parseProxy(line) {
  const s = String(line || '').trim();
  if (!s || s.startsWith('#')) return null;
  let m = s.match(/^(https?|socks5h?|socks4):\/\/(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)/i);
  if (!m) m = s.match(/^(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)$/);
  if (!m) return null;
  if (m.length === 6) {
    const raw = m[1].toLowerCase();
    if (raw === 'socks4') return null;
    return { protocol: raw.startsWith('socks') ? 'socks5' : 'http', host: m[4], port: Number(m[5]), auth: m[2] ? `${m[2]}:${m[3]}` : null, line: s };
  }
  return { protocol: 'http', host: m[3], port: Number(m[4]), auth: m[1] ? `${m[1]}:${m[2]}` : null, line: s };
}

function directConnect(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`connect timeout (${host}:${port})`)); }, timeoutMs);
    sock.once('error', (e) => { clearTimeout(t); try { sock.destroy(); } catch {} reject(new Error(`connect failed: ${e.message}`)); });
    sock.once('connect', () => { clearTimeout(t); resolve(sock); });
  });
}

function connectThrough(proxy, host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxy.host, port: proxy.port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`proxy timeout (${proxy.host}:${proxy.port})`)); }, timeoutMs);
    const done = (err, s) => { clearTimeout(t); if (err) { try { sock.destroy(); } catch {} reject(err); } else resolve(s); };
    sock.once('error', (e) => done(new Error(`proxy connect failed: ${e.message}`)));
    sock.once('connect', () => {
      if (proxy.protocol === 'socks5') {
        sock.write(proxy.auth ? Buffer.from([5, 2, 0, 2]) : Buffer.from([5, 1, 0]));
        let stage = 0;
        let buf = Buffer.alloc(0);
        const sendConnect = () => {
          const hb = Buffer.from(host);
          sock.write(Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 0xff])]));
        };
        const onData = (d) => {
          buf = Buffer.concat([buf, d]);
          for (;;) {
            if (stage === 0) {
              if (buf.length < 2) return;
              const v = buf; buf = buf.slice(2);
              if (v[0] !== 5) return done(new Error('SOCKS5 bad version'));
              if (v[1] === 2) {
                if (!proxy.auth) return done(new Error('SOCKS5 auth required'));
                const [u, p] = proxy.auth.split(':');
                sock.write(Buffer.concat([Buffer.from([1, u.length]), Buffer.from(u), Buffer.from([p.length]), Buffer.from(p)]));
                stage = 1;
                continue;
              }
              if (v[1] !== 0) return done(new Error('SOCKS5 no acceptable method'));
              stage = 2; sendConnect(); continue;
            }
            if (stage === 1) {
              if (buf.length < 2) return;
              const v = buf; buf = buf.slice(2);
              if (v[1] !== 0) return done(new Error('SOCKS5 auth failed'));
              stage = 2; sendConnect(); continue;
            }
            if (stage === 2) {
              if (buf.length < 5) return;
              const atyp = buf[3];
              const need = 4 + (atyp === 1 ? 4 : atyp === 3 ? 1 + buf[4] : 16) + 2;
              if (buf.length < need) return;
              const rep = buf[1]; buf = buf.slice(need);
              if (rep !== 0) return done(new Error(`SOCKS5 connect failed (code ${rep})`));
              sock.off('data', onData);
              return done(null, sock);
            }
          }
        };
        sock.on('data', onData);
        return;
      }
      const auth = proxy.auth ? `Proxy-Authorization: Basic ${Buffer.from(proxy.auth).toString('base64')}\r\n` : '';
      sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n${auth}\r\n`);
      let buf = '';
      const onData = (d) => {
        buf += d;
        if (!buf.includes('\r\n\r\n')) return;
        sock.off('data', onData);
        if (!/^HTTP\/\d(\.\d)? 200/.test(buf)) return done(new Error(`proxy CONNECT refused: ${buf.split('\r\n')[0]}`));
        done(null, sock);
      };
      sock.on('data', onData);
    });
  });
}

/** One HTTPS request through one exit (or directly when proxy is null). */
async function exitFetch(proxy, url, { method = 'GET', headers = {}, body = null, timeoutMs = TIMEOUT_MS, cookieJar = null } = {}) {
  const u = new URL(url);
  const raw = proxy ? await connectThrough(proxy, u.hostname, u.port || 443, timeoutMs) : await directConnect(u.hostname, u.port || 443, timeoutMs);
  const sock = tls.connect({ socket: raw, servername: u.hostname });
  await new Promise((res, rej) => { sock.once('secureConnect', res); sock.once('error', rej); });
  const all = { 'user-agent': UA, accept: '*/*', ...headers };
  if (cookieJar && cookieJar.header()) all.cookie = cookieJar.header();
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = http.request({ method, path: u.pathname + u.search, createConnection: () => sock, headers: { host: u.host, ...all } });
    const t = setTimeout(() => { try { req.destroy(); } catch {} reject(new Error('request timeout')); }, timeoutMs);
    req.on('response', (res) => {
      if (cookieJar) cookieJar.absorb(res.headers['set-cookie']);
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => { clearTimeout(t); resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }); });
    });
    req.on('error', (e) => { clearTimeout(t); reject(e); });
    if (body != null) req.write(Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
    req.end();
  });
}

async function exitJson(proxy, url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body != null && typeof opts.body !== 'string' && !Buffer.isBuffer(opts.body) && !headers['content-type']) headers['content-type'] = 'application/json';
  const r = await exitFetch(proxy, url, { ...opts, headers });
  let json = null;
  try { json = JSON.parse(r.body); } catch {}
  return { status: r.status, json, text: r.body };
}

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

// ------------------------------------------------------------------- browser
class CDP {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.id = 0; this.pending = new Map(); this.listeners = new Map(); }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve(this);
      this.ws.onerror = (e) => reject(new Error('cdp socket error: ' + (e.message || 'unknown')));
      this.ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data)); } catch { return; }
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: rs, reject: rj } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          msg.error ? rj(new Error(msg.error.message)) : rs(msg.result);
          return;
        }
        const key = `${msg.sessionId || ''}:${msg.method}`;
        for (const fn of this.listeners.get(key) || []) fn(msg.params);
      };
    });
  }
  send(method, params = {}, sessionId = null) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const t = setTimeout(() => { if (this.pending.delete(id)) reject(new Error(`cdp timeout: ${method}`)); }, Math.max(TIMEOUT_MS, 30000));
      this.pending.set(id, { resolve: (v) => { clearTimeout(t); resolve(v); }, reject: (e) => { clearTimeout(t); reject(e); } });
      this.ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
    });
  }
  on(method, fn, sessionId = null) {
    const key = `${sessionId || ''}:${method}`;
    if (!this.listeners.has(key)) this.listeners.set(key, []);
    this.listeners.get(key).push(fn);
  }
  close() { try { this.ws.close(); } catch {} }
}

function chromePath() {
  const fromArg = arg('chrome', null);
  const candidates = [fromArg, ...CHROME_CANDIDATES].filter(Boolean);
  for (const c of candidates) { try { if (fs.existsSync(c)) return c; } catch {} }
  return null;
}

async function launchChrome(port) {
  const bin = chromePath();
  if (!bin) throw new Error('Chrome not found — pass --chrome <path>');
  const profileDir = path.join(os.tmpdir(), `iteracompute-cdp-${Date.now().toString(36)}`);
  const args = [
    `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
  ];
  if (HEADLESS) args.unshift('--headless=new', '--window-size=560,860');
  else args.unshift('--window-size=560,860', '--window-position=40,40');
  const child = spawn(bin, args, { detached: !HEADLESS, stdio: 'ignore', windowsHide: true });
  if (!HEADLESS) child.unref();
  for (let i = 0; i < 60; i++) {
    try {
      const info = await exitJson(null, `http://127.0.0.1:${port}/json/version`, { timeoutMs: 2000 });
      if (info.json && info.json.webSocketDebuggerUrl) return { child, profileDir, wsUrl: info.json.webSocketDebuggerUrl };
    } catch {}
    await sleep(500);
  }
  throw new Error('Chrome did not expose CDP');
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

/**
 * Solve the panel's Turnstile in a real tab and return the token plus its nonce.
 * The widget lives in a CLOSED shadow root, so the click goes to the host box.
 */
async function solveTurnstile(cdp, ctx, proxy, { rounds = 10, gapMs = 4500 } = {}) {
  const target = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId: ctx.browserContextId });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  const loaded = new Promise((r) => { cdp.on('Page.loadEventFired', r, sessionId); setTimeout(r, 30000); });
  await cdp.send('Page.navigate', { url: `${SITE}/sign-up` }, sessionId);
  await loaded;
  await sleep(2500);
  const evalIn = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise }, sessionId);
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
    return r.result && r.result.value;
  };
  await evalIn(`(() => { const b = [...document.querySelectorAll('button')].find((x) => /^\\s*decline\\s*$/i.test(x.innerText || '')); if (b) b.click(); return true; })()`).catch(() => null);
  await evalIn(`(async () => {
    const cfg = await (await fetch('/api/control/v1/auth/challenge/config', { headers: { accept: 'application/json' }, credentials: 'same-origin' })).json();
    window.__icCfg = cfg;
    if (typeof turnstile === 'undefined') {
      await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.onload = res; s.onerror = () => rej(new Error('api.js failed')); document.head.appendChild(s); });
      await new Promise((r) => setTimeout(r, 800));
    }
    const old = document.getElementById('ic-ts-host'); if (old) old.remove();
    const div = document.createElement('div');
    div.id = 'ic-ts-host';
    div.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483647;background:#fff;padding:2px;width:320px';
    document.body.appendChild(div);
    window.__icTok = ''; window.__icErr = null;
    turnstile.render(div, {
      sitekey: cfg.site_key, action: 'register', cData: cfg.registration_nonce,
      language: 'en', theme: 'auto',
      callback: (t) => { window.__icTok = t; },
      'error-callback': (c) => { window.__icErr = 'cb:' + c; },
      'timeout-callback': () => { window.__icErr = 'timeout'; },
    });
    return 'mounted';
  })()`, true).catch((e) => log('   mount:', e.message));
  await sleep(3500);

  let token = '';
  let lastErr = null;
  for (let r = 1; r <= rounds; r++) {
    token = (await evalIn('String(window.__icTok || "")').catch(() => '')) || '';
    lastErr = await evalIn('String(window.__icErr || "")').catch(() => '');
    if (token.length > 20) break;
    const box = await evalIn(`(() => { const h = document.getElementById('ic-ts-host'); if (!h) return null; const b = h.getBoundingClientRect(); return { x: b.left + 30, y: b.top + b.height / 2 }; })()`).catch(() => null);
    if (box) {
      const x = Math.round(box.x);
      const y = Math.round(box.y);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, pointerType: 'mouse' }, sessionId);
      await sleep(80);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' }, sessionId);
      await sleep(50);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1, pointerType: 'mouse' }, sessionId);
    }
    await sleep(gapMs);
  }
  return { token: token.length > 20 ? token : '', err: lastErr, sessionId, targetId: target.targetId, evalIn, cdp };
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
  for (const k of keys) {
    const models = await listModels(key, k).catch((e) => ({ status: 0, error: e.message }));
    const gate = await chatGate(key, k).catch((e) => ({ status: 0, gate: 'FAIL', error: e.message }));
    if (gate.gate === 'PASS') pass++;
    log(`  ${k.slice(0, 10)}… models=${models.status} chat=${gate.status} ${gate.gate}${gate.error ? ' ' + JSON.stringify(gate.error).slice(0, 80) : ''}`);
  }
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
