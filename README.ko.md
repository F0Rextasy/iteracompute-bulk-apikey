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

**자동 생성된 API 키로 IteraCompute 계정을 대량 생성 — OpenAI 호환 추론과 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-31-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 왜 이 도구가 필요한가

IteraCompute는 서구의 OpenAI 호환 게이트웨이(`platform.iteracompute.com`의 자체 컨트롤 플레인, `api.iteracompute.com`의 추론 API)로, 모든 계정에 **진정한 무료 티어**를 제공합니다: `qwen/qwen3.8-27b`는 **1M 토큰당 $0**(입력, 캐시된 입력, 출력)으로 청구되며, **역월당 30M 토큰**까지, 128K 컨텍스트와 160K TPM, **신용카드 불필요**. 관문은 필수 Cloudflare **Turnstile** 위젯이므로, 이 도구는 그 한 단계만 실제 Chrome을 구동하고 나머지는 모두 일반 HTTPS로 처리합니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 무료 모델 | **`qwen/qwen3.8-27b`** — 1M 입력 / 캐시된 입력 / 출력당 `$0` (공개 카탈로그에서 `is_free: true`) |
| 월 허용량 | 계정당 **30M 토큰**(입력 + 출력 + 추론), 일일 한도 없음, 매월 1일 00:00 UTC에 초기화 |
| 컨텍스트 / TPM | **128K** 컨텍스트(출력은 8192로 제한) · **160K TPM** |
| 카드 | **불필요** — 이메일 또는 Google 가입, 충전 필요 없음 |
| 티어 | $10 순 충전 → 100M/월(300K TPM); $50 → 300M/월(256K 컨텍스트). Qwen은 모든 티어에서 $0 유지 |
| 소진된 할당량 | `429 free_model_monthly_limit`(월간) · `free_model_tpm_limit`(TPM) · `provider_rate_limit`(대기열/용량) |
| 가입 관문 | **Cloudflare Turnstile 필수**(`action: register`, `cData: registration_nonce`) — 위젯은 **보이는, 포커스된 브라우저 창**에서만 해결됨 |
| 로그인 관문 | **캡차 없음**(`POST /api/control/v1/auth/login`), `mfa_required: false` — 계정당 추가 키는 저렴함 |
| 확장 단위 | **계정 하나 = 키 하나 = 월 30M 토큰** |

> 💡 무료 티어는 IteraCompute가 설정하며 변경될 수 있습니다. 실시간 수치는 [iteracompute.com](https://iteracompute.com)에서 확인하세요 — 그리고 도구 자체의 관문이 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 31개 전부

공개, 키 불필요 카탈로그(`GET /api.iteracompute.com/v1/models`)에는 **31개 모델**이 있으며, 정확히 두 개가 무료로 표시됩니다:

| 모델 ID | 검증됨 |
| --- | --- |
| `qwen/qwen3.8-27b` | `keys.txt`의 모든 키에 대해 **chat-200**(관문: 비어 있지 않은 콘텐츠 또는 추론) |
| `moonshotai/kimi-k3-free` | 카탈로그에 무료로 표시됨 |

유료 쪽은 평범합니다: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (1M 입력/출력당).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 API 사용 방법

베이스 URL **`https://api.iteracompute.com/v1`** — OpenAI 호환(`/chat/completions`, `/responses`, SSE 스트리밍, 모델이 지원하는 경우 도구 호출). 콘솔 호스트는 `platform.iteracompute.com`이고 마케팅 사이트는 `iteracompute.com`입니다; 문서는 apex 호스트에서만 제공됩니다.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 빠른 시작

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

키는 `POST /v1/chat/completions`가 실제 콘텐츠 또는 추론 콘텐츠와 함께 200을 응답한 **후에만** `keys.txt`에 기록됩니다; `accounts.jsonl`은 이메일 / 비밀번호 / 키 ID / 모델 / 관문을 보관합니다. Node 18+(전역 `WebSocket`)과 Google Chrome이 필요합니다 — 브라우저는 Turnstile 단계에만 사용됩니다.

### 🖱️ 런처

## ✅ 검증됨 — 모든 키가 테스트됨

| 검사 | 결과 |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31개 모델, `qwen/qwen3.8-27b` `is_free: true`, `$0` 가격 |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, `__Host-iteracompute_registration` 쿠키에 바인딩된 일회성 `registration_nonce` |
| 패널 자체 sitekey로 Turnstile | **보이는 창에서 해결됨**(1–2회 클릭 라운드, 토큰 ≈816자); 파킹/최소화된 창은 **error 600010**(*bot behavior detected*) 응답 |
| 테스트 sitekey `1x…AA` / `3x…FF` | 동일한 브라우저에서 둘 다 통과 — 테스트 키는 환경을 결코 증명하지 못함 |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; 메일은 `accounts@<panel-mail>`에서 **인증 링크**와 함께 도착 |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — 일회성 토큰은 메일 본문에 있으며, 패널은 링크를 여는 것이 아니라 이 **POST**로 인증됨 |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — 기록되기 전 **모든** 키에 대해 | 실제 콘텐츠와 함께 **200** |

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 챌린지 | `GET /api/control/v1/auth/challenge/config` | sitekey + 일회성 `registration_nonce`; 응답은 등록 쿠키도 설정함 |
| 메일박스 | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | 계정당 하나의 Microsoft plus-별칭 |
| 캡차 | CDP를 통한 Chrome, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | 위젯의 호스트 박스를 클릭; iframe은 **닫힌** 섀도 루트에 있음 |
| 등록 | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| 링크 읽기 | `POST temp.tf/api/check` | 일반 텍스트 본문에 `…/verify-email?token=…` 포함 |
| 인증 | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; 링크를 그냥 GET하는 것은 아무 효과 없음 |
| 로그인 | `POST /api/control/v1/auth/login` `{email, password}` | 캡차 없음; 세션 + CSRF 쿠키 |
| 키 | `POST /api/control/v1/api-keys` `{display_name}` | 쿠키에서 CSRF 헤더; `x-csrf-token` |
| 관문 | `POST /v1/chat/completions` | 200 + 비어 있지 않은 콘텐츠/추론, 그렇지 않으면 키가 기록되지 않음 |

## ⚙️ CLI 옵션

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| 플래그 / 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | 출구 목록, 한 줄에 프록시 하나 |
| `--model ID` | `qwen/qwen3.8-27b` | 채팅 관문에 사용되는 모델 |
| `--headless` | 꺼짐 | 캡차 브라우저를 헤드리스로 실행(Turnstile은 그러면 error 600 응답 — 검증 표 참조) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | 자동 감지 | Chrome 바이너리 |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | 페이싱 및 재시도 |

계정은 의도적으로 **직렬로** 생성됩니다: 챌린지는 하나의 보이는 창을 요구하고, 패널의 메일러는 `202`보다 뒤처질 수 있습니다.

## 🛰️ 프록시 뒤에서

**코드에서는 선택 사항이지만, 실제로는 강력히 권장됩니다.** 풀이 없으면 CLI는 `running WITHOUT a proxy (direct)`를 출력하고 자신의 주소에서 연결합니다.

- **풀이 있는 경우:** `--pool <file>`을 전달하거나(또는 `ITERACOMPUTE_PROXIES` 설정) 계정에 대한 모든 요청 — 챌린지, 등록, 메일박스, 채팅 관문 — 이 하나의 고정된 출구를 통해 가므로, 등록하는 주소가 곧 사용하는 주소입니다. `--screen`은 목록을 자체 테스트하고 살아 있는 것들을 `out/exits-live.txt`에 기록합니다.
- 패널의 컨트롤 플레인은 일반 HTTPS 단계에 대해 데이터센터 출구를 문제 삼지 않습니다; **Turnstile** 단계가 민감한 단계이며, 이는 출구가 아니라 *브라우저*에 민감합니다(파킹된 창은 어떤 출구에서도 실패하고, 보이는 창은 WARP에서 해결되었습니다).

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 라이브 검증된 키 — git-ignored |
| `accounts.jsonl` | 이메일 / 비밀번호 / 표시 이름 / 출구 / 모델 / 관문 — git-ignored |
| `proxies.txt` | 사용자의 출구 — git-ignored |
| `out/` | 실행 로그 및 출구 자체 테스트 결과 — git-ignored |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

기본값: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. 모델은 `iteracompute/qwen3.8-27b`로 제공됩니다.

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node public-cli.js --connect-omniroute --base http://localhost:20128 --password 123456
```

기본값: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. 모델은 `iteracompute/qwen3.8-27b`로 제공됩니다.
## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 제공자가 주는 것 | **월 30M 무료 토큰** — `qwen/qwen3.8-27b` 토큰당 $0, 카드 불필요 |
| 🔑 키 하나로 얻는 것 | 자체 계정의 키 하나, `qwen/qwen3.8-27b`에서 채팅 검증됨 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 데이터 | `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` 및 `challenges.cloudflare.com`에만 접속 |

## 🐞 이슈

IterACompute가 챌린지 구성, 가입 흐름 또는 무료 티어를 변경하면, 도구는 해당 단계에서 멈추고 그 단계를 명시합니다. 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>