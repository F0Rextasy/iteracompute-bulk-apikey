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

**Crie contas IteraCompute em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI mais um conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Camada gratuita](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-31-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

IteraCompute é um gateway ocidental compatível com OpenAI (seu próprio plano de controle em `platform.iteracompute.com`, a API de inferência em `api.iteracompute.com`) que dá a cada conta uma **camada gratuita genuína**: `qwen/qwen3.8-27b` é cobrado a **$0 por 1M tokens** (entrada, entrada em cache e saída), até **30M tokens por mês calendário**, contexto de 128K e 160K TPM, **sem cartão de crédito**. A barreira é um widget **Turnstile** obrigatório da Cloudflare, então esta ferramenta controla um Chrome real apenas para essa etapa e faz todo o resto via HTTPS simples.

## 🎁 Camada gratuita — quanto você recebe

| O quê | Valor |
| --- | --- |
| Modelo gratuito | **`qwen/qwen3.8-27b`** — `$0` por 1M de entrada / entrada em cache / saída (`is_free: true` no catálogo público) |
| Cota mensal | **30M tokens** por conta (entrada + saída + raciocínio), sem limite diário, reinicia no dia 1 às 00:00 UTC |
| Contexto / TPM | contexto de **128K** (saída limitada a 8192) · **160K TPM** |
| Cartão | **nenhum** — cadastro por e-mail ou Google, sem necessidade de recarga |
| Níveis | $10 de recarga líquida → 100M/mês (300K TPM); $50 → 300M/mês (contexto de 256K). Qwen permanece $0 em todos os níveis |
| Cota esgotada | `429 free_model_monthly_limit` (mensal) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (fila/capacidade) |
| Barreira de cadastro | **Cloudflare Turnstile obrigatório** (`action: register`, `cData: registration_nonce`) — o widget só resolve em uma **janela de navegador visível e em foco** |
| Barreira de login | **sem captcha** (`POST /api/control/v1/auth/login`), `mfa_required: false` — chaves extras por conta são baratas |
| A unidade que escala | **uma conta = uma chave = 30M tokens/mês** |

> 💡 A camada gratuita é definida pela IteraCompute e pode mudar. Confira os números ao vivo em [iteracompute.com](https://iteracompute.com) — e deixe a própria barreira da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 31

O catálogo público, sem chave (`GET /api.iteracompute.com/v1/models`) contém **31 modelos**; exatamente dois estão marcados como gratuitos:

| ID do modelo | Verificado |
| --- | --- |
| `qwen/qwen3.8-27b` | **chat-200** para cada chave em `keys.txt` (barreira: conteúdo ou raciocínio não vazio) |
| `moonshotai/kimi-k3-free` | listado como gratuito no catálogo |

O lado pago é comum: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (por 1M entrada/saída).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 Como usar a API

URL base **`https://api.iteracompute.com/v1`** — compatível com OpenAI (`/chat/completions`, `/responses`, streaming SSE, chamada de ferramentas onde o modelo suporta). O host do console é `platform.iteracompute.com` e o site de marketing é `iteracompute.com`; apenas o host raiz serve a documentação.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Início rápido

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

Uma chave é gravada em `keys.txt` **somente** depois que `POST /v1/chat/completions` responde 200 com conteúdo real ou conteúdo de raciocínio; `accounts.jsonl` mantém e-mail / senha / id da chave / modelo / barreira. Requer Node 18+ (`WebSocket` global) e Google Chrome — o navegador é usado apenas para a etapa do Turnstile.

### 🖱️ O inicializador

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 modelos, `qwen/qwen3.8-27b` `is_free: true`, preço `$0` |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, `registration_nonce` de uso único vinculado ao cookie `__Host-iteracompute_registration` |
| Turnstile com a própria sitekey do painel | **resolve em uma janela visível** (1–2 rodadas de clique, token ≈816 caracteres); uma janela minimizada/em segundo plano responde **erro 600010** (*bot behavior detected*) |
| Sitekeys de teste `1x…AA` / `3x…FF` | ambas passam no mesmo navegador — uma chave de teste nunca prova o ambiente |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; o e-mail chega de `accounts@<panel-mail>` com um **link de verificação** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — o token de uso único fica no corpo do e-mail, e o painel é verificado por este **POST**, não abrindo o link |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — para **cada** chave antes de ser gravada | **200** com conteúdo real |

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| desafio | `GET /api/control/v1/auth/challenge/config` | sitekey + `registration_nonce` de uso único; a resposta também define o cookie de registro |
| caixa de correio | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | um alias plus da Microsoft por conta |
| captcha | Chrome via CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | clique na caixa host do widget; o iframe fica em um shadow root **fechado** |
| registro | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| ler link | `POST temp.tf/api/check` | o corpo em texto simples contém `…/verify-email?token=…` |
| verificar | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; um GET simples do link não faz nada |
| login | `POST /api/control/v1/auth/login` `{email, password}` | sem captcha; cookies de sessão + CSRF |
| chave | `POST /api/control/v1/api-keys` `{display_name}` | cabeçalho CSRF a partir do cookie; `x-csrf-token` |
| barreira | `POST /v1/chat/completions` | 200 + conteúdo/raciocínio não vazio, senão a chave não é gravada |

## ⚙️ Opções da CLI

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Flag / env | Padrão | Significado |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | lista de saídas, um proxy por linha |
| `--model ID` | `qwen/qwen3.8-27b` | modelo usado para a barreira de chat |
| `--headless` | desligado | executa o navegador do captcha em modo headless (o Turnstile então responde erro 600 — veja a tabela de verificação) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | detecção automática | binário do Chrome |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | ritmo e tentativas |

As contas são criadas **serialmente** de propósito: o desafio exige uma janela visível, e o serviço de e-mail do painel pode atrasar em relação ao `202`.

## 🛰️ Atrás de um proxy

**Opcional no código, fortemente recomendado na prática.** Sem um pool, a CLI imprime `running WITHOUT a proxy (direct)` e se conecta a partir do seu próprio endereço.

- **Com um pool:** passe `--pool <file>` (ou defina `ITERACOMPUTE_PROXIES`) e toda requisição de uma conta — desafio, registro, caixa de correio, barreira de chat — passa por uma saída fixada, então o endereço que registra é o endereço que resgata. `--screen` testa a lista e grava as ativas em `out/exits-live.txt`.
- O plano de controle do painel aceita saídas de datacenter para as etapas HTTPS simples; a etapa do **Turnstile** é a sensível, e ela é sensível ao *navegador*, não à saída (uma janela em segundo plano falha em qualquer saída; uma visível resolveu no WARP).

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada ao vivo por linha — ignorado pelo git |
| `accounts.jsonl` | e-mail / senha / nome de exibição / saída / modelo / barreira — ignorado pelo git |
| `proxies.txt` | suas saídas — ignorado pelo git |
| `out/` | logs de execução e resultados do autoteste de saídas — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado, compatível com OpenAI:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

Padrões: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Os modelos são servidos como `iteracompute/qwen3.8-27b`.

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado, compatível com OpenAI:

```bash
node public-cli.js --connect-omniroute --base http://localhost:20128 --password 123456
```

Padrões: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Os modelos são servidos como `iteracompute/qwen3.8-27b`.
## 🔑 O que uma chave lhe dá

| | |
| --- | --- |
| 🏢 Provedor | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 O que o provedor dá | **30M tokens gratuitos/mês** — `qwen/qwen3.8-27b` a $0 por token, sem cartão |
| 🔑 O que uma chave lhe dá | uma chave em sua própria conta, verificada por chat em `qwen/qwen3.8-27b` |
| 🌐 Formato da API | compatível com OpenAI: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Seus dados | apenas `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` e `challenges.cloudflare.com` são contatados |

## 🐞 Problemas

Se a IterACompute mudar sua configuração de desafio, seu fluxo de cadastro ou sua camada gratuita, a ferramenta para nessa etapa e a nomeia. **[Abra uma issue](../../issues)** com o comando e a saída exata.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>