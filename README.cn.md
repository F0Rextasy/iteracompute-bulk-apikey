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

**批量创建 IteraCompute 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理服务，外加一个 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-31-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

IteraCompute 是一个西方的、兼容 OpenAI 的网关（其控制平面位于 `platform.iteracompute.com`，推理 API 位于 `api.iteracompute.com`），它为每个账户提供**真正的免费额度**：`qwen/qwen3.8-27b` 按 **每 100 万 token 收费 $0**（输入、缓存输入和输出），每个自然月最高 **3000 万 token**，128K 上下文和 160K TPM，且**无需信用卡**。唯一的门槛是强制性的 Cloudflare **Turnstile** 组件，因此本工具仅在这一步驱动真实的 Chrome，其余所有操作都通过普通 HTTPS 完成。

## 🎁 免费额度 — 你能获得多少

| 项目 | 值 |
| --- | --- |
| 免费模型 | **`qwen/qwen3.8-27b`** — 每 100 万输入 / 缓存输入 / 输出均为 `$0`（公开目录中 `is_free: true`） |
| 每月额度 | 每个账户 **3000 万 token**（输入 + 输出 + 推理），无每日上限，每月 1 日 00:00 UTC 重置 |
| 上下文 / TPM | **128K** 上下文（输出上限 8192）· **160K TPM** |
| 信用卡 | **无需** — 邮箱或 Google 注册，无需充值 |
| 套餐层级 | 净充值 $10 → 每月 1 亿（300K TPM）；$50 → 每月 3 亿（256K 上下文）。Qwen 在所有层级中始终保持 $0 |
| 额度耗尽 | `429 free_model_monthly_limit`（每月）· `free_model_tpm_limit`（TPM）· `provider_rate_limit`（队列/容量） |
| 注册门槛 | **需要 Cloudflare Turnstile**（`action: register`，`cData: registration_nonce`）— 该组件仅在**可见且获得焦点的浏览器窗口**中才能通过 |
| 登录门槛 | **无验证码**（`POST /api/control/v1/auth/login`），`mfa_required: false` — 每个账户额外生成密钥成本很低 |
| 可扩展的单元 | **一个账户 = 一个密钥 = 每月 3000 万 token** |

> 💡 免费额度由 IteraCompute 设定，可能会变化。请在 [iteracompute.com](https://iteracompute.com) 查看实时数据 — 并让工具自身的验证关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 31 个

公开的、无需密钥的目录（`GET /api.iteracompute.com/v1/models`）包含 **31 个模型**；其中恰好两个被标记为免费：

| 模型 ID | 已验证 |
| --- | --- |
| `qwen/qwen3.8-27b` | `keys.txt` 中每个密钥均为 **chat-200**（关卡：非空内容或推理内容） |
| `moonshotai/kimi-k3-free` | 目录中列为免费 |

付费部分很普通：`deepseek/deepseek-v4.1-flash` $0.17/$0.70，`z-ai/glm-5.3-flash` $0.08/$0.28，`gpt-6-luna` $0.08/$0.40（每 100 万输入/输出）。

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 如何使用 API

基础 URL **`https://api.iteracompute.com/v1`** — 兼容 OpenAI（`/chat/completions`、`/responses`、SSE 流式传输、在模型支持时支持工具调用）。控制台主机为 `platform.iteracompute.com`，营销站点为 `iteracompute.com`；只有顶级域名主机提供文档。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 快速开始

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

只有当 `POST /v1/chat/completions` 返回 200 且带有真实内容或推理内容时，密钥才会被写入 `keys.txt`；`accounts.jsonl` 保存邮箱 / 密码 / 密钥 id / 模型 / 关卡。需要 Node 18+（全局 `WebSocket`）和 Google Chrome — 浏览器仅用于 Turnstile 步骤。

### 🖱️ 启动器

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查项 | 结果 |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**，31 个模型，`qwen/qwen3.8-27b` `is_free: true`，`$0` 定价 |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`，sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`，一次性 `registration_nonce` 绑定到 `__Host-iteracompute_registration` cookie |
| 使用面板自身 sitekey 的 Turnstile | **在可见窗口中通过**（1–2 轮点击，token ≈816 字符）；停靠/最小化的窗口返回 **error 600010**（*检测到机器人行为*） |
| 测试 sitekey `1x…AA` / `3x…FF` | 在同一浏览器中均通过 — 测试密钥永远无法证明环境 |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`；邮件来自 `accounts@<panel-mail>`，带有**验证链接** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — 一次性 token 位于邮件正文中，面板通过此 **POST** 验证，而非打开链接 |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`、`__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions`（`qwen/qwen3.8-27b`）— 对**每个**密钥在写入前 | **200** 且带有真实内容 |

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + 一次性 `registration_nonce`；响应还会设置注册 cookie |
| mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | 每个账户一个 Microsoft plus 别名 |
| captcha | Chrome over CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | 点击组件的宿主框；iframe 位于**封闭的** shadow root 中 |
| register | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| read link | `POST temp.tf/api/check` | 纯文本正文带有 `…/verify-email?token=…` |
| verify | `POST /api/control/v1/auth/verify-email` `{token}` | `204`；仅用 GET 打开链接不会有任何效果 |
| login | `POST /api/control/v1/auth/login` `{email, password}` | 无验证码；会话 + CSRF cookie |
| key | `POST /api/control/v1/api-keys` `{display_name}` | 从 cookie 获取 CSRF 头；`x-csrf-token` |
| gate | `POST /v1/chat/completions` | 200 + 非空内容/推理内容，否则不写入密钥 |

## ⚙️ CLI 选项

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| 标志 / 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | 出口列表，每行一个代理 |
| `--model ID` | `qwen/qwen3.8-27b` | 用于聊天关卡的模型 |
| `--headless` | 关闭 | 以无头模式运行验证码浏览器（Turnstile 随后返回 error 600 — 见已验证表格） |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | 自动检测 | Chrome 二进制文件 |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | 节奏控制和重试 |

账户是**串行**创建的，这是有意为之：挑战需要一个可见窗口，而且面板的邮件发送器可能滞后于 `202`。

## 🛰️ 在代理后面

**代码中可选，实践中强烈推荐。** 没有代理池时，CLI 会打印 `running WITHOUT a proxy (direct)` 并从你自己的地址连接。

- **使用代理池时：** 传入 `--pool <file>`（或设置 `ITERACOMPUTE_PROXIES`），账户的每个请求 — challenge、register、mailbox、chat gate — 都通过一个固定的出口，因此注册的地址就是兑换的地址。`--screen` 会自测列表并将可用的写入 `out/exits-live.txt`。
- 面板的控制平面对普通 HTTPS 步骤使用数据中心出口没有问题；**Turnstile** 步骤是敏感的一步，而它对*浏览器*敏感，而非对出口敏感（停靠的窗口在任何出口上都会失败；可见的窗口在 WARP 上也能通过）。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个经过实时验证的密钥 — 已被 git 忽略 |
| `accounts.jsonl` | 邮箱 / 密码 / 显示名称 / 出口 / 模型 / 关卡 — 已被 git 忽略 |
| `proxies.txt` | 你的出口 — 已被 git 忽略 |
| `out/` | 运行日志和出口自测结果 — 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管的、兼容 OpenAI 的路由器：

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

默认值：`--prefix iteracompute`、`--base-url https://api.iteracompute.com/v1`、`--model qwen/qwen3.8-27b`。模型以 `iteracompute/qwen3.8-27b` 形式提供。

## 🔑 一个密钥能给你带来什么

| | |
| --- | --- |
| 🏢 提供商 | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 提供商提供的内容 | **每月 3000 万免费 token** — `qwen/qwen3.8-27b` 每 token $0，无需信用卡 |
| 🔑 一个密钥能给你带来什么 | 在其独立账户上的一个密钥，已在 `qwen/qwen3.8-27b` 上通过聊天验证 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 你的数据 | 仅会联系 `platform.iteracompute.com`、`api.iteracompute.com`、`temp.tf` 和 `challenges.cloudflare.com` |

## 🐞 问题反馈

如果 IterACompute 更改了其挑战配置、注册流程或免费额度，工具会在该步骤停止并指出该步骤。请附上命令和确切输出**[提交 issue](../../issues)**。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>