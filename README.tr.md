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

**IteraCompute hesaplarını otomatik oluşturulan API anahtarlarıyla toplu oluşturun — OpenAI uyumlu çıkarım ve bir 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-31-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

IteraCompute, her hesaba **gerçek bir ücretsiz katman** sunan Batılı bir OpenAI uyumlu ağ geçididir (kendi kontrol düzlemi `platform.iteracompute.com` üzerinde, çıkarım API'si `api.iteracompute.com` üzerinde): `qwen/qwen3.8-27b` **1M token başına $0** olarak faturalandırılır (girdi, önbelleğe alınmış girdi ve çıktı), takvim ayı başına **30M token**'a kadar, 128K bağlam ve 160K TPM, **kredi kartı olmadan**. Kapı, zorunlu bir Cloudflare **Turnstile** widget'ıdır, bu nedenle bu araç yalnızca bu tek adım için gerçek bir Chrome'u çalıştırır ve diğer her şeyi düz HTTPS üzerinden yapar.

## 🎁 Ücretsiz katman — ne kadar elde edersiniz

| Ne | Değer |
| --- | --- |
| Ücretsiz model | **`qwen/qwen3.8-27b`** — 1M girdi / önbelleğe alınmış girdi / çıktı başına `$0` (genel katalogda `is_free: true`) |
| Aylık kota | Hesap başına **30M token** (girdi + çıktı + akıl yürütme), günlük sınır yok, ayın 1'inde 00:00 UTC'de sıfırlanır |
| Bağlam / TPM | **128K** bağlam (çıktı 8192 ile sınırlı) · **160K TPM** |
| Kart | **yok** — e-posta veya Google ile kayıt, yükleme gerekmez |
| Katmanlar | $10 net yükleme → 100M/ay (300K TPM); $50 → 300M/ay (256K bağlam). Qwen her katmanda $0 kalır |
| Tükenmiş kota | `429 free_model_monthly_limit` (aylık) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (kuyruk/kapasite) |
| Kayıt kapısı | **Cloudflare Turnstile gerekli** (`action: register`, `cData: registration_nonce`) — widget yalnızca **görünür, odaklanmış bir tarayıcı penceresinde** çözülür |
| Giriş kapısı | **captcha yok** (`POST /api/control/v1/auth/login`), `mfa_required: false` — hesap başına ek anahtarlar ucuzdur |
| Ölçeklenen birim | **bir hesap = bir anahtar = ayda 30M token** |

> 💡 Ücretsiz katman IteraCompute tarafından belirlenir ve değişebilir. Güncel sayıları [iteracompute.com](https://iteracompute.com) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 31'inin tamamı

Genel, anahtarsız katalog (`GET /api.iteracompute.com/v1/models`) **31 model** içerir; tam olarak ikisi ücretsiz olarak işaretlenmiştir:

| Model Kimliği | Doğrulandı |
| --- | --- |
| `qwen/qwen3.8-27b` | `keys.txt` içindeki her anahtar için **chat-200** (kapı: boş olmayan içerik veya akıl yürütme) |
| `moonshotai/kimi-k3-free` | katalogda ücretsiz olarak listelenmiş |

Ücretli taraf sıradandır: `deepseek/deepseek-v4.1-flash` $0.17/$0.70, `z-ai/glm-5.3-flash` $0.08/$0.28, `gpt-6-luna` $0.08/$0.40 (1M girdi/çıktı başına).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 API nasıl kullanılır

Temel URL **`https://api.iteracompute.com/v1`** — OpenAI uyumlu (`/chat/completions`, `/responses`, SSE akışı, modelin desteklediği yerlerde araç çağırma). Konsol ana bilgisayarı `platform.iteracompute.com` ve pazarlama sitesi `iteracompute.com`'dur; belgeleri yalnızca kök ana bilgisayar sunar.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Hızlı başlangıç

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

Bir anahtar `keys.txt` dosyasına **yalnızca** `POST /v1/chat/completions` gerçek içerik veya akıl yürütme içeriğiyle 200 yanıtı verdikten sonra yazılır; `accounts.jsonl` e-posta / parola / anahtar kimliği / model / kapı bilgilerini tutar. Node 18+ (genel `WebSocket`) ve Google Chrome gerektirir — tarayıcı yalnızca Turnstile adımı için kullanılır.

### 🖱️ Başlatıcı

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 model, `qwen/qwen3.8-27b` `is_free: true`, `$0` fiyatlandırma |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, `__Host-iteracompute_registration` çerezine bağlı tek kullanımlık `registration_nonce` |
| Panelin kendi sitekey'i ile Turnstile | **görünür bir pencerede çözülür** (1–2 tıklama turu, token ≈816 karakter); park edilmiş/küçültülmüş pencere **error 600010** yanıtı verir (*bot behavior detected*) |
| Test sitekey'leri `1x…AA` / `3x…FF` | ikisi de aynı tarayıcıda geçer — bir test anahtarı ortamı asla kanıtlamaz |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}`; posta `accounts@<panel-mail>` adresinden bir **doğrulama bağlantısı** ile gelir |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — tek kullanımlık token posta gövdesinde bulunur ve panel bu **POST** ile doğrulanır, bağlantıyı açarak değil |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — yazılmadan önce **her** anahtar için | gerçek içerikle **200** |

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + tek kullanımlık `registration_nonce`; yanıt ayrıca kayıt çerezini ayarlar |
| mailbox | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | hesap başına bir Microsoft plus-alias |
| captcha | Chrome over CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | widget'ın host kutusuna tıklayın; iframe **kapalı** bir shadow root içinde bulunur |
| register | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| read link | `POST temp.tf/api/check` | düz metin gövdesi `…/verify-email?token=…` içerir |
| verify | `POST /api/control/v1/auth/verify-email` `{token}` | `204`; bağlantıya yalın bir GET hiçbir şey yapmaz |
| login | `POST /api/control/v1/auth/login` `{email, password}` | captcha yok; oturum + CSRF çerezleri |
| key | `POST /api/control/v1/api-keys` `{display_name}` | çerezden CSRF başlığı; `x-csrf-token` |
| gate | `POST /v1/chat/completions` | 200 + boş olmayan içerik/akıl yürütme, aksi halde anahtar yazılmaz |

## ⚙️ CLI seçenekleri

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Bayrak / ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | çıkış listesi, satır başına bir proxy |
| `--model ID` | `qwen/qwen3.8-27b` | sohbet kapısı için kullanılan model |
| `--headless` | kapalı | captcha tarayıcısını headless çalıştır (Turnstile ardından error 600 yanıtı verir — doğrulama tablosuna bakın) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | otomatik algıla | Chrome ikili dosyası |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | tempo ve yeniden denemeler |

Hesaplar kasıtlı olarak **seri** oluşturulur: challenge tek bir görünür pencere ister ve panelin posta göndericisi `202`'nin gerisinde kalabilir.

## 🛰️ Proxy arkasında

**Kodda isteğe bağlı, pratikte şiddetle önerilir.** Havuz olmadan CLI `running WITHOUT a proxy (direct)` yazdırır ve kendi adresinizden bağlanır.

- **Havuzla:** `--pool <file>` geçin (veya `ITERACOMPUTE_PROXIES` ayarlayın) ve bir hesap için her istek — challenge, register, mailbox, chat gate — tek bir sabitlenmiş çıkıştan geçer, böylece kaydolan adres kullanan adrestir. `--screen` listeyi kendi kendine test eder ve canlı olanları `out/exits-live.txt` dosyasına yazar.
- Panelin kontrol düzlemi düz HTTPS adımları için veri merkezi çıkışlarıyla sorun yaşamaz; hassas olan adım **Turnstile**'dır ve bu çıkışa değil *tarayıcıya* karşı hassastır (park edilmiş bir pencere her çıkışta başarısız olur; görünür bir pencere WARP üzerinde çözüldü).

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir canlı doğrulanmış anahtar — git tarafından yok sayılır |
| `accounts.jsonl` | e-posta / parola / görünen ad / çıkış / model / kapı — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız — git tarafından yok sayılır |
| `out/` | çalıştırma günlükleri ve çıkış kendi kendine test sonuçları — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

Varsayılanlar: `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Modeller `iteracompute/qwen3.8-27b` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 Sağlayıcının verdikleri | **ayda 30M ücretsiz token** — `qwen/qwen3.8-27b` token başına $0, kart yok |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabında bir anahtar, `qwen/qwen3.8-27b` üzerinde sohbet doğrulamalı |
| 🌐 API şekli | OpenAI uyumlu: `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` ve `challenges.cloudflare.com` ile iletişim kurulur |

## 🐞 Sorunlar

IterACompute challenge yapılandırmasını, kayıt akışını veya ücretsiz katmanını değiştirirse, araç o adımda durur ve adını belirtir. Komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey katkıda bulunanlar

</div>