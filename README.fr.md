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

**Créez en masse des comptes IteraCompute avec des clés API générées automatiquement — inférence compatible OpenAI plus un connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-31%20served-412991?style=for-the-badge)](https://api.iteracompute.com/v1/models)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Niveau gratuit](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-31-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

IteraCompute est une passerelle occidentale compatible OpenAI (son propre plan de contrôle sur `platform.iteracompute.com`, l'API d'inférence sur `api.iteracompute.com`) qui offre à chaque compte un **véritable niveau gratuit** : `qwen/qwen3.8-27b` est facturé à **0 $ par million de tokens** (entrée, entrée mise en cache et sortie), jusqu'à **30 M de tokens par mois calendaire**, contexte de 128 K et 160 K TPM, **sans carte bancaire**. La barrière est un widget Cloudflare **Turnstile** obligatoire, donc cet outil pilote un vrai Chrome pour cette seule étape et fait tout le reste en HTTPS simple.

## 🎁 Niveau gratuit — ce que vous obtenez

| Élément | Valeur |
| --- | --- |
| Modèle gratuit | **`qwen/qwen3.8-27b`** — `0 $` par million d'entrée / entrée mise en cache / sortie (`is_free: true` dans le catalogue public) |
| Allocation mensuelle | **30 M de tokens** par compte (entrée + sortie + raisonnement), pas de plafond journalier, réinitialisation le 1er à 00:00 UTC |
| Contexte / TPM | **128 K** de contexte (sortie plafonnée à 8192) · **160 K TPM** |
| Carte | **aucune** — inscription par e-mail ou Google, aucune recharge nécessaire |
| Paliers | Recharge nette de 10 $ → 100 M/mois (300 K TPM) ; 50 $ → 300 M/mois (contexte 256 K). Qwen reste à 0 $ dans tous les paliers |
| Quota épuisé | `429 free_model_monthly_limit` (mensuel) · `free_model_tpm_limit` (TPM) · `provider_rate_limit` (file/capacité) |
| Barrière d'inscription | **Cloudflare Turnstile requis** (`action: register`, `cData: registration_nonce`) — le widget ne se résout que dans une **fenêtre de navigateur visible et au premier plan** |
| Barrière de connexion | **pas de captcha** (`POST /api/control/v1/auth/login`), `mfa_required: false` — des clés supplémentaires par compte sont peu coûteuses |
| L'unité qui s'adapte | **un compte = une clé = 30 M de tokens/mois** |

> 💡 Le niveau gratuit est défini par IteraCompute et peut changer. Consultez les chiffres en direct sur [iteracompute.com](https://iteracompute.com) — et laissez la barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 31 au complet

Le catalogue public, sans clé (`GET /api.iteracompute.com/v1/models`) contient **31 modèles** ; exactement deux sont marqués gratuits :

| ID du modèle | Vérifié |
| --- | --- |
| `qwen/qwen3.8-27b` | **chat-200** pour chaque clé dans `keys.txt` (barrière : contenu ou raisonnement non vide) |
| `moonshotai/kimi-k3-free` | listé comme gratuit dans le catalogue |

Le côté payant est ordinaire : `deepseek/deepseek-v4.1-flash` 0,17 $/0,70 $, `z-ai/glm-5.3-flash` 0,08 $/0,28 $, `gpt-6-luna` 0,08 $/0,40 $ (par million entrée/sortie).

```bash
curl https://api.iteracompute.com/v1/chat/completions \
  -H "Authorization: Bearer sk-Axni…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.8-27b","messages":[{"role":"user","content":"Hello!"}],"max_tokens":256,"reasoning":false}'
```

## 🧪 Comment utiliser l'API

URL de base **`https://api.iteracompute.com/v1`** — compatible OpenAI (`/chat/completions`, `/responses`, streaming SSE, appel d'outils là où le modèle les prend en charge). L'hôte de la console est `platform.iteracompute.com` et le site marketing est `iteracompute.com` ; seul l'hôte apex sert la documentation.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.iteracompute.com/v1", api_key="sk-Axni…")
print(c.chat.completions.create(model="qwen/qwen3.8-27b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Démarrage rapide

```bash
cd iteracompute-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node public-cli.js --count 10               # mint 10 accounts -> 10 chat-verified keys
node public-cli.js --verify-only            # re-run the gate on every key
node public-cli.js --screen                 # exit pool self-test
node public-cli.js --connect-9router        # register the keys with a local 9Router
```

Une clé n'est écrite dans `keys.txt` **qu'après** que `POST /v1/chat/completions` ait répondu 200 avec du contenu réel ou du contenu de raisonnement ; `accounts.jsonl` conserve e-mail / mot de passe / id de clé / modèle / barrière. Nécessite Node 18+ (`WebSocket` global) et Google Chrome — le navigateur n'est utilisé que pour l'étape Turnstile.

### 🖱️ Le lanceur

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `GET /api.iteracompute.com/v1/models` | **200**, 31 modèles, `qwen/qwen3.8-27b` `is_free: true`, tarification `0 $` |
| `GET /api/control/v1/auth/challenge/config` | **200** — `required: true`, sitekey `0x4AAAAAAFbST_1ZkXSNwxOb`, `registration_nonce` à usage unique lié au cookie `__Host-iteracompute_registration` |
| Turnstile avec la sitekey du panneau lui-même | **se résout dans une fenêtre visible** (1–2 tours de clic, token ≈816 caractères) ; une fenêtre en arrière-plan/minimisée répond **erreur 600010** (*bot behavior detected*) |
| Sitekeys de test `1x…AA` / `3x…FF` | les deux passent dans le même navigateur — une clé de test ne prouve jamais l'environnement |
| `POST /api/control/v1/auth/register` | **202** `{"status":"verification_email_queued"}` ; le courriel arrive de `accounts@<panel-mail>` avec un **lien de vérification** |
| `POST /api/control/v1/auth/verify-email` `{token}` | **204** — le token à usage unique se trouve dans le corps du courriel, et le panneau est vérifié par ce **POST**, pas en ouvrant le lien |
| `POST /api/control/v1/auth/login` | **200** `{"mfa_required":false}` + `__Host-iteracompute_session`, `__Host-iteracompute_csrf` |
| `POST /api/control/v1/api-keys` `{display_name}` | **201** `{key:{id, display_name, status:"active", last_four}}` |
| `POST /v1/chat/completions` (`qwen/qwen3.8-27b`) — pour **chaque** clé avant son écriture | **200** avec du contenu réel |

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: IteraCompute page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.iteracompute.com/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| challenge | `GET /api/control/v1/auth/challenge/config` | sitekey + `registration_nonce` à usage unique ; la réponse définit aussi le cookie d'inscription |
| boîte mail | `GET temp.tf/api/account?providers=outlook,hotmail&plus=1` | un alias plus Microsoft par compte |
| captcha | Chrome via CDP, `turnstile.render(host, {sitekey, action:'register', cData:nonce})` | cliquez sur la boîte hôte du widget ; l'iframe vit dans un shadow root **fermé** |
| inscription | `POST /api/control/v1/auth/register` `{email, password, accepted_terms, turnstile_token}` | `202 verification_email_queued` |
| lire le lien | `POST temp.tf/api/check` | le corps en texte brut contient `…/verify-email?token=…` |
| vérification | `POST /api/control/v1/auth/verify-email` `{token}` | `204` ; un simple GET du lien ne fait rien |
| connexion | `POST /api/control/v1/auth/login` `{email, password}` | pas de captcha ; cookies de session + CSRF |
| clé | `POST /api/control/v1/api-keys` `{display_name}` | en-tête CSRF issu du cookie ; `x-csrf-token` |
| barrière | `POST /v1/chat/completions` | 200 + contenu/raisonnement non vide, sinon la clé n'est pas écrite |

## ⚙️ Options CLI

```bash
node public-cli.js --count N            # mint N accounts (default 5)
node public-cli.js --model moonshotai/kimi-k3-free
node public-cli.js --verify-only        # re-verify every key in keys.txt
node public-cli.js --screen             # exit pool self-test
node public-cli.js --connect-9router
node public-cli.js --help
```

| Option / env | Défaut | Signification |
| --- | --- | --- |
| `--pool FILE` · `ITERACOMPUTE_PROXIES` | `proxies.txt` | liste de sorties, un proxy par ligne |
| `--model ID` | `qwen/qwen3.8-27b` | modèle utilisé pour la barrière de chat |
| `--headless` | désactivé | exécuter le navigateur du captcha en mode headless (Turnstile répond alors erreur 600 — voir le tableau vérifié) |
| `--chrome PATH` · `ITERACOMPUTE_CHROME` | auto-détection | binaire Chrome |
| `--gap MS` · `--tries N` · `--timeout MS` | 3000 · 2 · 60000 | cadencement et tentatives |

Les comptes sont créés **sériellement** à dessein : le challenge veut une fenêtre visible, et le mailer du panneau peut prendre du retard sur le `202`.

## 🛰️ Derrière un proxy

**Optionnel dans le code, fortement recommandé en pratique.** Sans pool, le CLI affiche `running WITHOUT a proxy (direct)` et se connecte depuis votre propre adresse.

- **Avec un pool :** passez `--pool <file>` (ou définissez `ITERACOMPUTE_PROXIES`) et chaque requête pour un compte — challenge, inscription, boîte mail, barrière de chat — passe par une sortie épinglée, donc l'adresse qui s'inscrit est l'adresse qui utilise. `--screen` teste automatiquement la liste et écrit les sorties actives dans `out/exits-live.txt`.
- Le plan de contrôle du panneau tolère les sorties de centre de données pour les étapes HTTPS simples ; l'étape **Turnstile** est la sensible, et elle est sensible au *navigateur*, pas à la sortie (une fenêtre en arrière-plan échoue sur n'importe quelle sortie ; une fenêtre visible s'est résolue sur WARP).

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée en direct par ligne — ignoré par git |
| `accounts.jsonl` | e-mail / mot de passe / nom d'affichage / sortie / modèle / barrière — ignoré par git |
| `proxies.txt` | vos sorties — ignoré par git |
| `out/` | journaux d'exécution et résultats d'auto-test des sorties — ignoré par git |

## 🔌 Connexion à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI :

```bash
node public-cli.js --connect-9router --base http://localhost:20128 --password 123456
```

Valeurs par défaut : `--prefix iteracompute`, `--base-url https://api.iteracompute.com/v1`, `--model qwen/qwen3.8-27b`. Les modèles sont servis sous `iteracompute/qwen3.8-27b`.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **IteraCompute** — [iteracompute.com](https://iteracompute.com) |
| 🎁 Ce que le fournisseur offre | **30 M de tokens gratuits/mois** — `qwen/qwen3.8-27b` à 0 $ par token, sans carte |
| 🔑 Ce qu'une clé vous apporte | une clé sur son propre compte, vérifiée par chat sur `qwen/qwen3.8-27b` |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://api.iteracompute.com/v1/chat/completions` |
| 🔒 Vos données | seuls `platform.iteracompute.com`, `api.iteracompute.com`, `temp.tf` et `challenges.cloudflare.com` sont contactés |

## 🐞 Problèmes

Si IterACompute modifie sa configuration de challenge, son flux d'inscription ou son niveau gratuit, l'outil s'arrête à cette étape et la nomme. **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 iteracompute-bulk-apikey contributors

</div>