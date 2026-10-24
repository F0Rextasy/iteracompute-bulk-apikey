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

**Массовое создание аккаунтов IteraCompute с автоматически сгенерированными API-ключами — инференс, совместимый с OpenAI, плюс коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-31-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

IteraCompute — это западный шлюз, совместимый с OpenAI (собственная панель управления на `platform.iteracompute.com`, API инференса на `api.iteracompute.com`), который даёт каждому аккаунту **настоящий бесплатный тариф**: `qwen/qwen3.8-27b` тарифицируется по **$0 за 1M токенов** (входные, кэшированные входные и выходные), до **30M токенов за календарный месяц**, контекст 128K и 160K TPM, **без кредитной карты**. Препятствием является обязательный виджет Cloudflare **Turnstile**, поэтому этот инструмент запускает настоящий Chrome только для этого одного шага, а всё остальное делает через обычный HTTPS.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Бесплатная модель | **`qwen/qwen3.8-27b`** — `$0` за 1M входных / кэшированных входных / выходных токенов (`is_free: true` в публичном каталоге) |
| Месячная квота | **30M токенов** на аккаунт (входные + выходные + рассуждения), без дневного лимита, сбрасывается 1-го числа в 00:00 UTC |
| Контекст / TPM | Контекст **128K** (выход ограничен 8192) · **160K TPM** |
| Карта | **не нужна** — регистрация по e-mail или через Google, пополнение не требуется |
| Уровни | Пополнение на $10 нетто → 100M/месяц (300K TPM); $50 → 300M/месяц (контекст 256K). Qwen остаётся $0 на любом уровне |
| Исчерпанная квота | `429 free_model_monthly_limit` (месячная) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (очередь/мощность) |
| Препятствие при регистрации | **Требуется Cloudflare Turnstile** (`action: register`, `cData: registration_nonce`) — виджет решается только в **видимом, сфокусированном окне браузера** |
| Препятствие при входе | **без капчи** (`POST /api/control/v1/auth/login`), `mfa_required: false` — дополнительные ключи на аккаунт обходятся дёшево |
| Единица масштабирования | **один аккаунт = один ключ = 30M токенов/месяц** |

> 💡 Бесплатный тариф устанавливается IteraCompute и может измениться. Проверяйте актуальные цифры на [iteracompute.com](https://iteracompute.com) — и пусть собственный гейт инструмента решит:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 31

Публичный каталог без ключа (`GET /api.iteracompute.com/v1/models`) содержит **31 модель**; ровно две помечены как бесплатные:

| ID модели | Проверено |
| --- | --- |
| `qwen/qwen3.8-27b` | **chat-200** для каждого ключа в `keys.txt` (гейт: непустой контент или рассуждения) |
| `moonshotai/kimi-k3-free` | указана как бесплатная в каталоге |

Платная сторона обычная: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (за 1M входных/выходных).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 Как использовать API

Базовый URL **`https://api.iteracompute.com/v1`** — совместим с OpenAI (`/chat/completions`, `/responses`, SSE-стриминг, вызов инструментов там, где модель их поддерживает). Хост консоли — `platform.iteracompute.com`, а маркетинговый сайт — `iteracompute.com`; документацию отдаёт только основной хост.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Быстрый старт

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

Ключ записывается в `keys.txt` **только** после того, как `POST /v1/chat/completions` вернёт 200 с реальным контентом или контентом рассуждений; `accounts.jsonl` хранит e-mail / пароль / id ключа / модель / гейт. Требуется Node 18+ (глобальный `WebSocket`) и Google Chrome — браузер используется только для шага Turnstile.

### 🖱️ Лаунчер

## ✅ Проверено в работе — каждый ключ тестируется

| Проверка | Результат |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 модель, `qwen/qwen3.8-27b` `is_free: true`, цена `$0` |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, одноразовый `registration_nonce`, привязанный к cookie `__Host-iteracompute_registration` |
| Turnstile с собственным sitekey панели | **решается в видимом окне** (1–2 раунда кликов, токен ≈816 символов); припаркованное/свёрнутое окно отвечает **error 600010** (*bot behavior detected*) |
| Тестовые sitekey `1x…AA` / `3x…FF` | оба проходят в одном и том же браузере — тестовый ключ никогда не доказывает окружение |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; письмо приходит от `accounts@<panel-mail>` со **ссылкой для верификации** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — одноразовый токен находится в теле письма, и панель верифицируется этим **POST**, а не открытием ссылки |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — для **каждого** ключа перед записью | **200** с реальным контентом |

## 🧭 Как это работает

```

inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + одноразовый `registration_nonce`; ответ также устанавливает cookie регистрации |
| mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | один Microsoft plus-алиас на аккаунт |
| captcha | Chrome через CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | кликните по host-блоку виджета; iframe находится в **закрытом** shadow root |
| register | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| read link | `POST temp.tf/api/check` | тело в виде простого текста содержит `…/verify-email?token=…` |
| verify | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; простой GET по ссылке ничего не делает |
| login | `POST /api/control/v1/auth/login` `{email, password}` | без капчи; cookie сессии + CSRF |
| key | `POST /api/control/v1/api-keys` `{display_name}` | заголовок CSRF из cookie; `x-csrf-token` |
| gate | `POST /v1/chat/completions` | 200 + непустой контент/рассуждения, иначе ключ не записывается |

## ⚙️ Опции CLI

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Флаг / env | По умолчанию | Значение |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | список выходов, один прокси на строку |
| `--model ID` | `qwen/qwen3.8-27b` | модель, используемая для чат-гейта |
| `--headless` | выкл. | запускать браузер капчи в headless-режиме (Turnstile тогда отвечает error 600 — см. таблицу проверок) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | автоопределение | бинарный файл Chrome |
| `--gap MS` · `--exits N` · `--timeout MS` | 3000 · 6 · 60000 | темп и повторы |

Аккаунты создаются **последовательно** намеренно: для challenge нужно одно видимое окно, а почтовый сервис панели может отставать от `202`.

## 🛰️ За прокси

**Необязательно в коде, настоятельно рекомендуется на практике.** Без пула CLI выводит `running WITHOUT a proxy (direct)` и подключается с вашего собственного адреса.

- **С пулом:** передайте `--pool <file>` (или задайте `ITERACOMPUTE_PROXIES`), и каждый запрос для аккаунта — challenge, register, mailbox, chat gate — идёт через один закреплённый выход, так что адрес, который регистрируется, — это адрес, который погашает. `--screen` самотестирует список и записывает живые в `out/exits-live.txt`.
- Панель управления нормально относится к датацентровым выходам для обычных HTTPS-шагов; шаг **Turnstile** — чувствительный, и он чувствителен к *браузеру*, а не к выходу (припаркованное окно падает на любом выходе; видимое решилось на WARP).

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один проверенный в работе ключ на строку — игнорируется git |
| `accounts.jsonl` | e-mail / пароль / отображаемое имя / выход / модель / гейт — игнорируется git |
| `proxies.txt` | ваши выходы — игнорируется git |
| `out/` | логи запусков и результаты самотестирования выходов — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

По умолчанию: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Модели подаются как `iteracompute/qwen3.8-27b`.

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node public-cli.js --connect-omniroute --base http://localhost:20128 --password 123456
```

По умолчанию: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Модели подаются как `iteracompute/qwen3.8-27b`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 Что даёт провайдер | **30M бесплатных токенов/месяц** — `qwen/qwen3.8-27b` по $0 за токен, без карты |
| 🔑 Что даёт один ключ | один ключ на собственном аккаунте, проверенный в чате на `qwen/qwen3.8-27b` |
| 🌐 Форма API | Совместим с OpenAI: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Ваши данные | устанавливается соединение только с `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` и `challenges.cloudflare.com` |

## 🐞 Проблемы

Если IterACompute изменит конфигурацию своего challenge, процесс регистрации или бесплатный тариф, инструмент остановится на этом шаге и назовёт его. **[Откройте issue](../../issues)** с командой и точным выводом.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>