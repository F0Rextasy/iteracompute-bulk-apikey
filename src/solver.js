'use strict';
/**
 * solver.js — the browser/captcha rail, moved verbatim out of cli.js: launch a
 * real Chrome, drive the panel's Turnstile in a tab and hand the token (plus
 * that tab's `evalIn`) back to the caller. Everything the mint path needs
 * besides it — the zero-dep HTTPS transport — lives here too, since the rail
 * polls Chrome's local DevTools endpoint through it.
 *
 * The Chrome flags and timeouts come from the same argv the CLI reads (one
 * process), so --chrome / --timeout / --headless keep working unchanged.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const tls = require('tls');
const http = require('http');
const { spawn } = require('child_process');

const SITE = 'https://platform.iteracompute.com';
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

const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
const HEADLESS = has('headless');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

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
  // Only an https target gets a TLS layer: Chrome's own CDP endpoint is plain
  // http on loopback, and tls.connect to it dies on the IP servername (that is
  // what "Chrome did not expose CDP" actually was).
  const secure = u.protocol === 'https:';
  const port = u.port || (secure ? 443 : 80);
  const raw = proxy ? await connectThrough(proxy, u.hostname, port, timeoutMs) : await directConnect(u.hostname, port, timeoutMs);
  const sock = secure ? tls.connect({ socket: raw, servername: u.hostname }) : raw;
  if (secure) await new Promise((res, rej) => { sock.once('secureConnect', res); sock.once('error', rej); });
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

/**
 * Solve the panel's Turnstile in a real tab and return the token plus its nonce.
 * The widget lives in a CLOSED shadow root, so the click goes to the host box.
 */
async function solveTurnstile(cdp, ctx, proxy, { rounds = 10, gapMs = 4500 } = {}) {
  const target = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId: ctx.browserContextId });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
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

module.exports = {
  arg,
  has,
  sleep,
  log,
  TIMEOUT_MS,
  HEADLESS,
  SITE,
  UA,
  CHROME_CANDIDATES,
  parseProxy,
  directConnect,
  connectThrough,
  exitFetch,
  exitJson,
  CDP,
  chromePath,
  launchChrome,
  solveTurnstile,
};
