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

**IteraCompute アカウントを自動生成された API キーとともに一括作成 — OpenAI 互換の推論に加えて 9Router コネクタも搭載。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-31-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 イシュー](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

IteraCompute は西側の OpenAI 互換ゲートウェイです（独自のコントロールプレーンは `platform.iteracompute.com`、推論 API は `api.iteracompute.com`）。すべてのアカウントに**本物の無料枠**を提供しています。`qwen/qwen3.8-27b` は **100 万トークンあたり $0**（入力、キャッシュ済み入力、出力）で課金され、**暦月あたり最大 3000 万トークン**、128K コンテキスト、160K TPM、そして**クレジットカード不要**です。関門となるのは必須の Cloudflare **Turnstile** ウィジェットなので、このツールはその 1 ステップのためだけに実際の Chrome を操作し、それ以外のすべては通常の HTTPS で行います。

## 🎁 無料枠 — どれだけ使えるか

| 項目 | 値 |
| --- | --- |
| 無料モデル | **`qwen/qwen3.8-27b`** — 100 万入力 / キャッシュ済み入力 / 出力あたり `$0`（公開カタログで `is_free: true`） |
| 月間許容量 | アカウントあたり **3000 万トークン**（入力 + 出力 + 推論）、日次上限なし、毎月 1 日 00:00 UTC にリセット |
| コンテキスト / TPM | **128K** コンテキスト（出力は 8192 が上限） · **160K TPM** |
| カード | **不要** — メールまたは Google サインアップ、チャージも不要 |
| ティア | $10 の純チャージ → 1 億/月（300K TPM）、$50 → 3 億/月（256K コンテキスト）。Qwen はどのティアでも $0 のまま |
| クォータ枯渇時 | `429 free_model_monthly_limit`（月次） · `free_model_tpm_limit`（TPM） · `provider_rate_limit`（キュー/キャパシティ） |
| サインアップの関門 | **Cloudflare Turnstile が必須**（`action: register`、`cData: registration_nonce`） — ウィジェットは**表示されフォーカスされたブラウザウィンドウ**でのみ解けます |
| ログインの関門 | **キャプチャなし**（`POST /api/control/v1/auth/login`）、`mfa_required: false` — アカウントごとの追加キーは安価です |
| スケールする単位 | **1 アカウント = 1 キー = 月 3000 万トークン** |

> 💡 無料枠は IteraCompute が設定するもので、変更される可能性があります。最新の数値は [iteracompute.com](https://iteracompute.com) で確認してください — そしてツール自身の関門に判断させましょう:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全 31 個

公開されたキー不要のカタログ（`GET /api.iteracompute.com/v1/models`）には **31 モデル**が掲載されており、無料としてフラグが立っているのはちょうど 2 つです:

| モデル ID | 検証状況 |
| --- | --- |
| `qwen/qwen3.8-27b` | `keys.txt` 内のすべてのキーで **chat-200**（関門: 空でない content または reasoning） |
| `moonshotai/kimi-k3-free` | カタログで無料として掲載 |

有料側はごく普通です: `deepseek/deepseek-v4.1-flash` $0.17/$0.70、`z-ai/glm-5.3-flash` $0.08/$0.28、`gpt-6-luna` $0.08/$0.40（100 万入力/出力あたり）。

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 API の使い方

ベース URL は **`https://api.iteracompute.com/v1`** — OpenAI 互換です（`/chat/completions`、`/responses`、SSE ストリーミング、モデルが対応していればツール呼び出し）。コンソールのホストは `platform.iteracompute.com`、マーケティングサイトは `iteracompute.com` です。ドキュメントを配信しているのは apex ホストのみです。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 クイックスタート

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

キーが `keys.txt` に書き込まれるのは、`POST /v1/chat/completions` が実際の content または reasoning content とともに 200 を返した**後だけ**です。`accounts.jsonl` にはメール / パスワード / キー ID / モデル / 関門が保持されます。Node 18+（グローバルの `WebSocket`）と Google Chrome が必要です — ブラウザは Turnstile のステップにのみ使用されます。

### 🖱️ ランチャー

## ✅ 動作検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**、31 モデル、`qwen/qwen3.8-27b` は `is_free: true`、`$0` 価格 |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`、sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`、`__Host-iteracompute_registration` Cookie に紐づくワンショットの `registration_nonce` |
| パネル自身の sitekey を使った Turnstile | **表示されたウィンドウで解けます**（1〜2 回のクリックラウンド、トークン ≈816 文字）。最小化/非アクティブなウィンドウでは **error 600010**（*bot behavior detected*）が返ります |
| テスト用 sitekey `1x…AA` / `3x…FF` | 同じブラウザでどちらも通過 — テストキーは環境を証明しません |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`。メールは `accounts@<panel-mail>` から**検証リンク**付きで届きます |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — ワンショットトークンはメール本文にあり、パネルはリンクを開くのではなくこの **POST** によって検証されます |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`、`__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions`（`qwen/qwen3.8-27b`）— 書き込まれる前の**すべての**キーに対して | 実際の content とともに **200** |

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + ワンショットの `registration_nonce`。レスポンスは登録 Cookie も設定します |
| mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | アカウントごとに 1 つの Microsoft plus エイリアス |
| captcha | CDP 経由の Chrome、`turnstile.render(host, {sitekey, action:'register', cData:nonce})` | ウィジェットのホストボックスをクリックします。iframe は**閉じた** shadow root 内にあります |
| register | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| read link | `POST temp.tf/api/check` | プレーンテキスト本文に `…/verify-email?token=…` が含まれます |
| verify | `POST /api/control/v1/auth/verify-email` `{token}` | `204`。リンクへの単なる GET では何も起こりません |
| login | `POST /api/control/v1/auth/login` `{email, password}` | キャプチャなし。セッション + CSRF Cookie |
| key | `POST /api/control/v1/api-keys` `{display_name}` | Cookie からの CSRF ヘッダー。`x-csrf-token` |
| gate | `POST /v1/chat/completions` | 200 + 空でない content/reasoning、そうでなければキーは書き込まれません |

## ⚙️ CLI オプション

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| フラグ / 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | 出口リスト、1 行につき 1 プロキシ |
| `--model ID` | `qwen/qwen3.8-27b` | チャット関門で使用するモデル |
| `--headless` | オフ | キャプチャ用ブラウザをヘッドレスで実行（その場合 Turnstile は error 600 を返します — 検証済みテーブルを参照） |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | 自動検出 | Chrome バイナリ |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | ペーシングとリトライ |

アカウントは意図的に**直列**で作成されます。チャレンジは 1 つの表示ウィンドウを必要とし、パネルのメーラーは `202` に遅れることがあるためです。

## 🛰️ プロキシの背後で

**コード上は任意、実運用では強く推奨。** プールがない場合、CLI は `running WITHOUT a proxy (direct)` と表示し、あなた自身のアドレスから接続します。

- **プールありの場合:** `--pool <file>` を渡す（または `ITERACOMPUTE_PROXIES` を設定する）と、あるアカウントのすべてのリクエスト — challenge、register、mailbox、chat gate — が 1 つの固定された出口を経由するので、登録するアドレスがそのまま利用するアドレスになります。`--screen` はリストを自己テストし、生きているものを `out/exits-live.txt` に書き出します。
- パネルのコントロールプレーンは通常の HTTPS ステップに関してはデータセンター出口でも問題ありません。**Turnstile** のステップが敏感な部分であり、それは出口ではなく*ブラウザ*に敏感です（非アクティブなウィンドウはどの出口でも失敗し、表示されたウィンドウは WARP 上でも解けました）。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つのライブ検証済みキー — git 管理外 |
| `accounts.jsonl` | メール / パスワード / 表示名 / 出口 / モデル / 関門 — git 管理外 |
| `proxies.txt` | あなたの出口 — git 管理外 |
| `out/` | 実行ログと出口自己テスト結果 — git 管理外 |

## 🔌 9Router に接続する

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

デフォルト: `--prefix iteracompute`、`--base-url https://api.iteracompute.com/v1`、`--model qwen/qwen3.8-27b`。モデルは `iteracompute/qwen3.8-27b` として提供されます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 プロバイダーが提供するもの | **月 3000 万無料トークン** — `qwen/qwen3.8-27b` が 1 トークン $0、カード不要 |
| 🔑 1 つのキーで得られるもの | 専用アカウント上の 1 つのキー、`qwen/qwen3.8-27b` でチャット検証済み |
| 🌐 API の形式 | OpenAI 互換: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 あなたのデータ | 接続先は `platform.iteracompute.com`、`api.iteracompute.com`、`temp.tf`、`challenges.cloudflare.com` のみです |

## 🐞 イシュー

IterACompute がチャレンジ設定、サインアップフロー、または無料枠を変更した場合、ツールはそのステップで停止し、そのステップを明示します。コマンドと正確な出力を添えて **[イシューを作成してください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>