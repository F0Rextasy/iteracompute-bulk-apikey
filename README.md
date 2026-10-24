<div align="center">

```
██╗████████╗███████╗██████╗  █████╗  ██████╗ ██████╗ ███╗   ███╗██████╗
██║╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔═══██╗████╗ ████║██╔══██╗
██║   ██║   █████╗  ██████╔╝███████║██║     ██║   ██║██╔████╔██║██████╔╝
██║   ██║   ██╔══╝  ██╔══██╗██╔══██║██║     ██║   ██║██║╚██╔╝██║██╔═══╝
██║   ██║   ███████╗██║  ██║██║  ██║╚██████╗╚██████╔╝██║ ╚═╝ ██║██║
╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝

██╗   ██╗████████╗███████╗
██║   ██║╚══██╔══╝██╔════╝
██║   ██║   ██║   █████╗
██║   ██║   ██║   ██╔══╝
╚██████╔╝   ██║   ███████╗
 ╚═════╝    ╚═╝   ╚══════╝
```

# iteracompute-bulk-apikey

**Bulk-create IteraCompute accounts with auto-generated API keys — OpenAI-compatible inference plus a 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-31-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

IteraCompute is a Western OpenAI-compatible gateway (its own control plane on `platform.iteracompute.com`, the inference API on `api.iteracompute.com`) that gives every account a **genuine free tier**: `qwen/qwen3.8-27b` is billed at **$0 per 1M tokens** (input, cached input and output), up to **30M tokens per calendar month**, 128K context and 160K TPM, with **no credit card**. The gate is a mandatory Cloudflare **Turnstile** widget, so this tool drives a real Chrome for that single step and does everything else over plain HTTPS.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Free model | **`qwen/qwen3.8-27b`** — `$0` per 1M input / cached input / output (`is_free: true` in the public catalogue) |
| Monthly allowance | **30M tokens** per account (input + output + reasoning), no daily cap, resets on the 1st at 00:00 UTC |
| Context / TPM | **128K** context (output capped at 8192) · **160K TPM** |
| Card | **none** — e-mail or Google signup, no recharge needed |
| Tiers | $10 net recharge → 100M/month (300K TPM); $50 → 300M/month (256K context). Qwen stays $0 in every tier |
| Exhausted quota | `429 free_model_monthly_limit` (monthly) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (queue/capacity) |
| Signup gate | **Cloudflare Turnstile required** (`action: register`, `cData: registration_nonce`) — the widget only solves in a **visible, focused browser window** |
| Login gate | **no captcha** (`POST /api/control/v1/auth/login`), `mfa_required: false` — extra keys per account are cheap |
| The unit that scales | **one account = one key = 30M tokens/month** |

> 💡 The free tier is set by IteraCompute and can change. Check the live numbers at [iteracompute.com](https://iteracompute.com) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 31 of them

The public, keyless catalogue (`GET /api.iteracompute.com/v1/models`) carries **31 models**; exactly two are flagged free:

| Model ID | Verified |
| --- | --- |
| `qwen/qwen3.8-27b` | **chat-200** for every key in `keys.txt` (gate: non-empty content or reasoning) |
| `moonshotai/kimi-k3-free` | listed free in the catalogue |

The paid side is ordinary: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (per 1M in/out).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 How to use the API

Base URL **`https://api.iteracompute.com/v1`** — OpenAI-compatible (`/chat/completions`, `/responses`, SSE streaming, tool calling where the model supports them). The console host is `platform.iteracompute.com` and the marketing site is `iteracompute.com`; only the apex host serves the docs.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Quick start

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

A key is written to `keys.txt` **only** after `POST /v1/chat/completions` answers 200 with real content or reasoning content; `accounts.jsonl` keeps e-mail / password / key id / model / gate. Requires Node 18+ (global `WebSocket`) and Google Chrome — the browser is used for the Turnstile step only.

### 🖱️ The launcher

## ✅ Verified working — every key is tested

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Works with **9Router and OmniRoute**.

| Check | Result |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 models, `qwen/qwen3.8-27b` `is_free: true`, `$0` pricing |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, one-shot `registration_nonce` bound to the `__Host-iteracompute_registration` cookie |
| Turnstile with the panel's own sitekey | **solves in a visible window** (1–2 click rounds, token ≈816 chars); a parked/minimised window answers **error 600010** (*bot behavior detected*) |
| Test sitekeys `1x…AA` / `3x…FF` | both pass in the same browser — a test key never proves the environment |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; the mail arrives from `accounts@<panel-mail>` with a **verification link** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — the one-shot token lives in the mail body, and the panel is verified by this **POST**, not by opening the link |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — for **every** key before it is written | **200** with real content |

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + one-shot `registration_nonce`; the response also sets the registration cookie |
| mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | one Microsoft plus-alias per account |
| captcha | Chrome over CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | click the widget's host box; the iframe lives in a **closed** shadow root |
| register | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| read link | `POST temp.tf/api/check` | the plain-text body carries `…/verify-email?token=…` |
| verify | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; a bare GET of the link does nothing |
| login | `POST /api/control/v1/auth/login` `{email, password}` | no captcha; session + CSRF cookies |
| key | `POST /api/control/v1/api-keys` `{display_name}` | CSRF header from the cookie; `x-csrf-token` |
| gate | `POST /v1/chat/completions` | 200 + non-empty content/reasoning, else the key is not written |

## ⚙️ CLI options

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Flag / env | Default | Meaning |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | exit list, one proxy per line |
| `--model ID` | `qwen/qwen3.8-27b` | model used for the chat gate |
| `--headless` | off | run the captcha browser headless (Turnstile then answers error 600 — see the verified table) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | auto-detect | Chrome binary |
| `--gap MS` · `--exits N` · `--timeout MS` | 3000 · 6 · 60000 | pacing and retries |

Accounts are minted **serially** on purpose: the challenge wants one visible window, and the panel's mailer can lag behind the `202`.

## 🛰️ Behind a proxy

**Optional in code, strongly recommended in practice.** Without a pool the CLI prints `running WITHOUT a proxy (direct)` and connects from your own address.

- **With a pool:** pass `--pool <file>` (or set `ITERACOMPUTE_PROXIES`) and every request for an account — challenge, register, mailbox, chat gate — goes through one pinned exit, so the address that registers is the address that redeems. `--screen` self-tests the list and writes the live ones to `out/exits-live.txt`.
- The panel's control plane is fine with datacenter exits for the plain HTTPS steps; the **Turnstile** step is the sensitive one, and it is sensitive to the *browser*, not the exit (a parked window fails on any exit; a visible one solved on WARP).

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line — git-ignored |
| `accounts.jsonl` | e-mail / password / display name / exit / model / gate — git-ignored |
| `proxies.txt` | your exits — git-ignored |
| `out/` | run logs and exit self-test results — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

Defaults: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Models are served as `iteracompute/qwen3.8-27b`.

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router:

```bash
node public-cli.js --connect-omniroute --base http://localhost:20128 --password 123456
```

Defaults: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Models are served as `iteracompute/qwen3.8-27b`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 What the provider gives | **30M free tokens/month** — `qwen/qwen3.8-27b` at $0 per token, no card |
| 🔑 What one key gets you | one key on its own account, chat-verified on `qwen/qwen3.8-27b` |
| 🌐 API shape | OpenAI-compatible: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Your data | only `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` and `challenges.cloudflare.com` are contacted |

## 🐞 Issues

If IterACompute changes its challenge configuration, its signup flow or its free tier, the tool stops at that step and names it. **[Open an issue](../../issues)** with the command and the exact output.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>
