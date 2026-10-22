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

**IteraCompute-Konten im Bulk erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz plus ein 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-31-of-them) · [🧪 Die API nutzen](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

IteraCompute ist ein westliches, OpenAI-kompatibles Gateway (mit eigener Control Plane auf `platform.iteracompute.com` und der Inferenz-API auf `api.iteracompute.com`), das jedem Konto einen **echten Free-Tier** bietet: `qwen/qwen3.8-27b` wird mit **$0 pro 1M Tokens** abgerechnet (Input, gecachter Input und Output), bis zu **30M Tokens pro Kalendermonat**, 128K Kontext und 160K TPM, **ohne Kreditkarte**. Die Hürde ist ein obligatorisches Cloudflare-**Turnstile**-Widget, weshalb dieses Tool für genau diesen einen Schritt ein echtes Chrome steuert und alles andere über reines HTTPS erledigt.

## 🎁 Free-Tier — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Kostenloses Modell | **`qwen/qwen3.8-27b`** — `$0` pro 1M Input / gecachtem Input / Output (`is_free: true` im öffentlichen Katalog) |
| Monatliches Kontingent | **30M Tokens** pro Konto (Input + Output + Reasoning), kein Tageslimit, Zurücksetzung am 1. um 00:00 UTC |
| Kontext / TPM | **128K** Kontext (Output auf 8192 begrenzt) · **160K TPM** |
| Karte | **keine** — E-Mail- oder Google-Anmeldung, kein Aufladen nötig |
| Tarife | $10 Netto-Aufladung → 100M/Monat (300K TPM); $50 → 300M/Monat (256K Kontext). Qwen bleibt in jedem Tarif $0 |
| Erschöpftes Kontingent | `429 free_model_monthly_limit` (monatlich) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (Warteschlange/Kapazität) |
| Registrierungshürde | **Cloudflare Turnstile erforderlich** (`action: register`, `cData: registration_nonce`) — das Widget löst sich nur in einem **sichtbaren, fokussierten Browserfenster** |
| Login-Hürde | **kein Captcha** (`POST /api/control/v1/auth/login`), `mfa_required: false` — zusätzliche Schlüssel pro Konto sind günstig |
| Die skalierende Einheit | **ein Konto = ein Schlüssel = 30M Tokens/Monat** |

> 💡 Der Free-Tier wird von IteraCompute festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [iteracompute.com](https://iteracompute.com) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 31

Der öffentliche, schlüsselfreie Katalog (`GET /api.iteracompute.com/v1/models`) enthält **31 Modelle**; genau zwei sind als kostenlos markiert:

| Modell-ID | Verifiziert |
| --- | --- |
| `qwen/qwen3.8-27b` | **chat-200** für jeden Schlüssel in `keys.txt` (Gate: nicht-leerer Inhalt oder Reasoning) |
| `moonshotai/kimi-k3-free` | im Katalog als kostenlos gelistet |

Die kostenpflichtige Seite ist gewöhnlich: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (pro 1M In/Out).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 So nutzt du die API

Basis-URL **`https://api.iteracompute.com/v1`** — OpenAI-kompatibel (`/chat/completions`, `/responses`, SSE-Streaming, Tool-Calling, wo die Modelle es unterstützen). Der Konsolen-Host ist `platform.iteracompute.com` und die Marketing-Seite ist `iteracompute.com`; nur der Apex-Host liefert die Docs aus.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Schnellstart

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

Ein Schlüssel wird **nur** dann in `keys.txt` geschrieben, wenn `POST /v1/chat/completions` mit 200 und echtem Inhalt oder Reasoning-Inhalt antwortet; `accounts.jsonl` speichert E-Mail / Passwort / Key-ID / Modell / Gate. Erfordert Node 18+ (globales `WebSocket`) und Google Chrome — der Browser wird nur für den Turnstile-Schritt verwendet.

### 🖱️ Der Launcher

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 Modelle, `qwen/qwen3.8-27b` `is_free: true`, `$0`-Preisgestaltung |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, Sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, einmalige `registration_nonce`, gebunden an das Cookie `__Host-iteracompute_registration` |
| Turnstile mit dem eigenen Sitekey des Panels | **löst sich in einem sichtbaren Fenster** (1–2 Klickrunden, Token ≈816 Zeichen); ein geparktes/minimiertes Fenster antwortet mit **Fehler 600010** (*bot behavior detected*) |
| Test-Sitekeys `1x…AA` / `3x…FF` | beide bestehen im selben Browser — ein Testschlüssel beweist nie die Umgebung |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; die Mail kommt von `accounts@<panel-mail>` mit einem **Verifizierungslink** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — der einmalige Token steckt im Mail-Body, und das Panel wird durch diesen **POST** verifiziert, nicht durch Öffnen des Links |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — für **jeden** Schlüssel, bevor er geschrieben wird | **200** mit echtem Inhalt |

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Challenge | `GET /api/control/v1/auth/challenge/config` | Sitekey + einmalige `registration_nonce`; die Antwort setzt außerdem das Registrierungs-Cookie |
| Mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | ein Microsoft-Plus-Alias pro Konto |
| Captcha | Chrome über CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | klicke auf die Host-Box des Widgets; das iframe liegt in einem **geschlossenen** Shadow Root |
| Registrieren | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| Link lesen | `POST temp.tf/api/check` | der Klartext-Body enthält `…/verify-email?token=…` |
| Verifizieren | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; ein bloßes GET des Links bewirkt nichts |
| Login | `POST /api/control/v1/auth/login` `{email, password}` | kein Captcha; Session- + CSRF-Cookies |
| Schlüssel | `POST /api/control/v1/api-keys` `{display_name}` | CSRF-Header aus dem Cookie; `x-csrf-token` |
| Gate | `POST /v1/chat/completions` | 200 + nicht-leerer Inhalt/Reasoning, sonst wird der Schlüssel nicht geschrieben |

## ⚙️ CLI-Optionen

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Flag / Env | Standard | Bedeutung |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | Exit-Liste, ein Proxy pro Zeile |
| `--model ID` | `qwen/qwen3.8-27b` | Modell, das für das Chat-Gate verwendet wird |
| `--headless` | aus | den Captcha-Browser headless ausführen (Turnstile antwortet dann mit Fehler 600 — siehe verifizierte Tabelle) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | automatische Erkennung | Chrome-Binary |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | Taktung und Wiederholungen |

Konten werden absichtlich **seriell** erstellt: Die Challenge will ein sichtbares Fenster, und der Mailer des Panels kann hinter dem `202` zurückbleiben.

## 🛰️ Hinter einem Proxy

**Im Code optional, in der Praxis dringend empfohlen.** Ohne Pool gibt die CLI `running WITHOUT a proxy (direct)` aus und verbindet sich von deiner eigenen Adresse.

- **Mit einem Pool:** übergib `--pool <file>` (oder setze `ITERACOMPUTE_PROXIES`), und jede Anfrage für ein Konto — Challenge, Registrierung, Mailbox, Chat-Gate — läuft über einen fest zugewiesenen Exit, sodass die Adresse, die registriert, auch die Adresse ist, die einlöst. `--screen` testet die Liste selbst und schreibt die funktionierenden in `out/exits-live.txt`.
- Die Control Plane des Panels kommt mit Datacenter-Exits für die reinen HTTPS-Schritte gut zurecht; der **Turnstile**-Schritt ist der sensible, und er reagiert auf den *Browser*, nicht auf den Exit (ein geparktes Fenster scheitert auf jedem Exit; ein sichtbares löste sich über WARP).

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile — von Git ignoriert |
| `accounts.jsonl` | E-Mail / Passwort / Anzeigename / Exit / Modell / Gate — von Git ignoriert |
| `proxies.txt` | deine Exits — von Git ignoriert |
| `out/` | Run-Logs und Ergebnisse des Exit-Selbsttests — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Modelle werden als `iteracompute/qwen3.8-27b` bereitgestellt.

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node public-cli.js --connect-omniroute --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Modelle werden als `iteracompute/qwen3.8-27b` bereitgestellt.
## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 Was der Anbieter gibt | **30M kostenlose Tokens/Monat** — `qwen/qwen3.8-27b` zu $0 pro Token, keine Karte |
| 🔑 Was ein Schlüssel dir bringt | ein Schlüssel auf einem eigenen Konto, chat-verifiziert auf `qwen/qwen3.8-27b` |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Deine Daten | nur `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` und `challenges.cloudflare.com` werden kontaktiert |

## 🐞 Issues

Wenn IterACompute seine Challenge-Konfiguration, seinen Registrierungsablauf oder seinen Free-Tier ändert, stoppt das Tool an diesem Schritt und benennt ihn. **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>