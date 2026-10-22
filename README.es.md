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

**Crea cuentas de IteraCompute en masa con claves API autogeneradas — inferencia compatible con OpenAI más un conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-31-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

IteraCompute es una pasarela occidental compatible con OpenAI (su propio plano de control en `platform.iteracompute.com`, la API de inferencia en `api.iteracompute.com`) que otorga a cada cuenta un **nivel gratuito genuino**: `qwen/qwen3.8-27b` se factura a **$0 por 1M de tokens** (entrada, entrada en caché y salida), hasta **30M de tokens por mes calendario**, contexto de 128K y 160K TPM, **sin tarjeta de crédito**. La barrera es un widget obligatorio de Cloudflare **Turnstile**, por lo que esta herramienta controla un Chrome real para ese único paso y hace todo lo demás mediante HTTPS simple.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Modelo gratuito | **`qwen/qwen3.8-27b`** — `$0` por 1M de entrada / entrada en caché / salida (`is_free: true` en el catálogo público) |
| Asignación mensual | **30M de tokens** por cuenta (entrada + salida + razonamiento), sin límite diario, se restablece el día 1 a las 00:00 UTC |
| Contexto / TPM | **128K** de contexto (salida limitada a 8192) · **160K TPM** |
| Tarjeta | **ninguna** — registro por correo electrónico o Google, sin necesidad de recarga |
| Niveles | $10 de recarga neta → 100M/mes (300K TPM); $50 → 300M/mes (contexto de 256K). Qwen sigue a $0 en todos los niveles |
| Cuota agotada | `429 free_model_monthly_limit` (mensual) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (cola/capacidad) |
| Barrera de registro | **Cloudflare Turnstile obligatorio** (`action: register`, `cData: registration_nonce`) — el widget solo se resuelve en una **ventana de navegador visible y enfocada** |
| Barrera de inicio de sesión | **sin captcha** (`POST /api/control/v1/auth/login`), `mfa_required: false` — las claves adicionales por cuenta son baratas |
| La unidad que escala | **una cuenta = una clave = 30M de tokens/mes** |

> 💡 El nivel gratuito lo define IteraCompute y puede cambiar. Consulta las cifras en vivo en [iteracompute.com](https://iteracompute.com) — y deja que la propia barrera de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 31

El catálogo público y sin clave (`GET /api.iteracompute.com/v1/models`) contiene **31 modelos**; exactamente dos están marcados como gratuitos:

| ID del modelo | Verificado |
| --- | --- |
| `qwen/qwen3.8-27b` | **chat-200** para cada clave en `keys.txt` (barrera: contenido o razonamiento no vacío) |
| `moonshotai/kimi-k3-free` | listado como gratuito en el catálogo |

El lado de pago es normal: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (por 1M de entrada/salida).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 Cómo usar la API

URL base **`https://api.iteracompute.com/v1`** — compatible con OpenAI (`/chat/completions`, `/responses`, streaming SSE, llamada a herramientas donde el modelo las admita). El host de la consola es `platform.iteracompute.com` y el sitio de marketing es `iteracompute.com`; solo el host raíz sirve la documentación.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Inicio rápido

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

Una clave se escribe en `keys.txt` **solo** después de que `POST /v1/chat/completions` responda 200 con contenido real o contenido de razonamiento; `accounts.jsonl` guarda correo electrónico / contraseña / id de clave / modelo / barrera. Requiere Node 18+ (`WebSocket` global) y Google Chrome — el navegador se usa solo para el paso de Turnstile.

### 🖱️ El lanzador

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 modelos, `qwen/qwen3.8-27b` `is_free: true`, precio `$0` |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, `registration_nonce` de un solo uso vinculado a la cookie `__Host-iteracompute_registration` |
| Turnstile con la propia sitekey del panel | **se resuelve en una ventana visible** (1–2 rondas de clics, token ≈816 caracteres); una ventana minimizada/inactiva responde **error 600010** (*bot behavior detected*) |
| Sitekeys de prueba `1x…AA` / `3x…FF` | ambas pasan en el mismo navegador — una clave de prueba nunca demuestra el entorno |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; el correo llega desde `accounts@<panel-mail>` con un **enlace de verificación** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — el token de un solo uso está en el cuerpo del correo, y el panel se verifica mediante este **POST**, no abriendo el enlace |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — para **cada** clave antes de escribirse | **200** con contenido real |

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + `registration_nonce` de un solo uso; la respuesta también establece la cookie de registro |
| mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | un alias plus de Microsoft por cuenta |
| captcha | Chrome sobre CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | haz clic en la caja host del widget; el iframe vive en un shadow root **cerrado** |
| register | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| read link | `POST temp.tf/api/check` | el cuerpo en texto plano contiene `…/verify-email?token=…` |
| verify | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; un GET simple del enlace no hace nada |
| login | `POST /api/control/v1/auth/login` `{email, password}` | sin captcha; cookies de sesión + CSRF |
| key | `POST /api/control/v1/api-keys` `{display_name}` | cabecera CSRF desde la cookie; `x-csrf-token` |
| gate | `POST /v1/chat/completions` | 200 + contenido/razonamiento no vacío, si no la clave no se escribe |

## ⚙️ Opciones de CLI

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Flag / env | Predeterminado | Significado |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | lista de salidas, un proxy por línea |
| `--model ID` | `qwen/qwen3.8-27b` | modelo usado para la barrera de chat |
| `--headless` | desactivado | ejecutar el navegador del captcha en modo headless (Turnstile entonces responde error 600 — ver la tabla de verificación) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | autodetección | binario de Chrome |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | ritmo y reintentos |

Las cuentas se crean **en serie** a propósito: el desafío requiere una ventana visible, y el servidor de correo del panel puede retrasarse respecto al `202`.

## 🛰️ Detrás de un proxy

**Opcional en el código, muy recomendado en la práctica.** Sin un pool, el CLI imprime `running WITHOUT a proxy (direct)` y se conecta desde tu propia dirección.

- **Con un pool:** pasa `--pool <file>` (o define `ITERACOMPUTE_PROXIES`) y cada solicitud de una cuenta — challenge, register, mailbox, chat gate — pasa por una salida fijada, de modo que la dirección que registra es la dirección que canjea. `--screen` autoprueba la lista y escribe las activas en `out/exits-live.txt`.
- El plano de control del panel acepta salidas de centro de datos para los pasos HTTPS simples; el paso de **Turnstile** es el sensible, y es sensible al *navegador*, no a la salida (una ventana inactiva falla en cualquier salida; una visible se resolvió en WARP).

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea — ignorada por git |
| `accounts.jsonl` | correo electrónico / contraseña / nombre para mostrar / salida / modelo / barrera — ignorado por git |
| `proxies.txt` | tus salidas — ignorado por git |
| `out/` | registros de ejecución y resultados de autoprueba de salidas — ignorado por git |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado compatible con OpenAI:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

Predeterminados: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Los modelos se sirven como `iteracompute/qwen3.8-27b`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 Qué da el proveedor | **30M de tokens gratuitos/mes** — `qwen/qwen3.8-27b` a $0 por token, sin tarjeta |
| 🔑 Qué te da una clave | una clave en su propia cuenta, verificada por chat en `qwen/qwen3.8-27b` |
| 🌐 Forma de la API | compatible con OpenAI: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` y `challenges.cloudflare.com` |

## 🐞 Problemas

Si IterACompute cambia su configuración de desafío, su flujo de registro o su nivel gratuito, la herramienta se detiene en ese paso y lo nombra. **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — ver [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>