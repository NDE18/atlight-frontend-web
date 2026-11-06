# Déploiement du web Atlight

Le web est servi sur **https://web.atlight.fr**, depuis le VPS Contabo `157.173.118.249` qui héberge déjà le backend (https://atlight.fr).

```
push sur main ─► GitHub Actions
                 1. Qualité et tests  : traductions, Prettier, ESLint, types, Vitest, build, Playwright
                 2. Image Docker      : build, essai de l'image, publication sur ghcr.io
                 3. Déploiement       : SSH sur le VPS ─► deploy/deploy.sh
                                                         ├─ conteneur atlight-web (127.0.0.1:3100)
                                                         └─ nginx web.atlight.fr (HTTPS Let's Encrypt)
```

Sur une pull request ou sur `develop`, seule l'étape 1 tourne. Le déploiement ne part que de `main`, après des tests verts.

## Ce qui tourne sur le serveur

| Élément          | Emplacement                                 | Rôle                                                                   |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| `~/atlight-web/` | dossier de l'utilisateur SSH                | `compose.yml`, `deploy.sh`, modèles nginx, `.env` (image et port)      |
| Conteneur        | `atlight-web`                               | Next.js autonome, écoute **uniquement** sur `127.0.0.1:3100`, 1 Go max |
| Site nginx       | `/etc/nginx/sites-available/web.atlight.fr` | HTTPS, redirection HTTP → HTTPS, relais vers le conteneur              |
| Certificat       | `/etc/letsencrypt/live/web.atlight.fr/`     | Obtenu au premier déploiement, renouvelé par le timer de certbot       |

Le backend, MySQL et le site nginx d'`atlight.fr` ne sont jamais modifiés. nginx n'est rechargé que si `nginx -t` accepte la nouvelle configuration, sinon l'ancienne est remise en place.

## Mise en place (une seule fois)

### 1. Ouvrir le port 80

Let's Encrypt vérifie le domaine en HTTP sur le port 80. Le 6 novembre 2026, depuis Internet, ce port **refusait** les connexions tout de suite, comme un port inutilisé (81), alors qu'un pare-feu les laisse d'ordinaire sans réponse. Le plus probable : nginx n'écoute que sur le 443. `deploy.sh` ajoute `listen 80` pour web.atlight.fr ; il reste à vérifier que le pare-feu laisse passer ce port.

Sur le VPS :

```bash
ssh <CONTABO_SSH_USER>@157.173.118.249
sudo ss -tlnp | grep -E ':(80|443) '   # qui écoute sur 80 et 443
sudo ufw status verbose                # « Status: inactive », ou une ligne 80/tcp ALLOW ?
sudo ufw allow 80/tcp                  # seulement si ufw est actif et que la ligne manque
```

Si un pare-feu est activé dans le panneau client Contabo, y autoriser aussi TCP 80 entrant. Après le premier déploiement, `curl -I http://web.atlight.fr` doit répondre `301` vers `https://`.

Sans ce port, le premier déploiement s'arrête à l'étape du certificat. Le renouvellement de celui d'`atlight.fr` (expiration le 11 janvier 2027) échouera aussi s'il passe par HTTP.

Le DNS est déjà prêt : `web.atlight.fr` pointe vers `157.173.118.249`.

### 2. Clé SSH de déploiement (recommandé)

Sur un poste de confiance :

```bash
ssh-keygen -t ed25519 -C "github-actions atlight-web" -f atlight-web-deploy -N ""
ssh-copy-id -i atlight-web-deploy.pub <utilisateur>@157.173.118.249
ssh-keyscan 157.173.118.249        # empreinte du serveur, pour CONTABO_SSH_KNOWN_HOSTS
```

L'utilisateur doit pouvoir lancer `docker` et `sudo` sans mot de passe, comme pour le déploiement du backend.

### 3. Secrets et variables du dépôt GitHub

_Settings → Secrets and variables → Actions._

**Secrets** : mêmes noms que dans le dépôt du backend. Les secrets GitHub sont propres à chaque dépôt : ceux d'`atlight-backend` ne sont pas visibles ici, ils doivent exister aussi dans `atlight-frontend-web` (secrets du dépôt, ou de son environnement `production`).

| Nom                       | Obligatoire             | Contenu                                                                  |
| ------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `CONTABO_HOST`            | non (`157.173.118.249`) | Adresse du VPS, comme pour le backend                                    |
| `CONTABO_SSH_USER`        | oui                     | Utilisateur SSH, comme pour le backend                                   |
| `CONTABO_SSH_PASSWORD`    | l'un des deux           | Mot de passe SSH, comme pour le backend                                  |
| `CONTABO_SSH_KEY`         | l'un des deux           | Clé privée `atlight-web-deploy`, prioritaire sur le mot de passe         |
| `CONTABO_SSH_PORT`        | non (22)                | Port SSH, comme pour le backend                                          |
| `CONTABO_SSH_KNOWN_HOSTS` | recommandé              | Sortie de `ssh-keyscan` ; sans lui, l'empreinte est acceptée à l'aveugle |
| `SENTRY_AUTH_TOKEN`       | non                     | Envoi des source maps à Sentry                                           |

**Variables** : aucune n'est obligatoire. Le déploiement du backend n'en utilise pas non plus.

La config « web » de Firebase (clé d'API, identifiant d'application) reprend par défaut celle du mobile (`lib/firebase_options.dart`), identique à `.env.local`. Ces valeurs sont publiques : elles finissent dans le JavaScript servi à tous les navigateurs. Une variable du même nom les remplace au besoin.

| Nom                                                      | Quand la créer                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `LETSENCRYPT_EMAIL`                                      | Conseillé : adresse des alertes d'expiration du certificat      |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`                         | Notifications Web Push (clé à générer dans la console Firebase) |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`                    | Google Analytics (vide aujourd'hui, comme sur le mobile)        |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Si Sentry est utilisé                                           |
| `WEB_PORT`                                               | Si le port local 3100 est déjà pris sur le VPS                  |

Le backend n'a rien à changer pour le lot 1 : le BFF l'appelle de serveur à serveur, sans en-tête `Origin`, donc la liste CORS ne joue pas. Le jour où le navigateur ouvrira le WebSocket (`wss://atlight.fr/ws`), il faudra ajouter `https://web.atlight.fr` à `setAllowedOrigins` dans `WebSocketConfig.java` (et à la liste CORS de `WebSecurityConfiguration.java` si le navigateur appelle l'API en direct). `APP_PUBLIC_BASE_URL` (liens de partage `/p/*`) reste `https://atlight.fr`, comme `NEXT_PUBLIC_SHARE_BASE_URL`.

### 4. Environnement `production`

Créé automatiquement au premier déploiement (_Settings → Environments_). On peut y exiger une validation manuelle avant chaque mise en production (_Required reviewers_).

## Déployer

- **Automatique** : chaque push sur `main` (merge de pull request compris).
- **Manuel** : _Actions → CI/CD → Run workflow_ sur `main`.

L'image est taguée `sha-<12 premiers caractères du commit>` (et `latest`). Le conteneur est remplacé en quelques secondes, puis la CI vérifie que `https://web.atlight.fr/api/health` renvoie bien ce tag. Un onglet resté ouvert sur l'ancienne version se recharge à la navigation suivante (`NEXT_DEPLOYMENT_ID`).

## Retour arrière

- **Automatique** : si le nouveau conteneur ne répond pas sur `/api/health` en 60 s, `deploy.sh` remet l'image précédente et la CI échoue.
- **À la main** : dans _Actions_, rouvrir l'exécution d'un commit antérieur et relancer seulement le job _Déploiement_. Ou, sur le serveur :

```bash
cd ~/atlight-web && WEB_IMAGE=ghcr.io/nde18/atlight-frontend-web WEB_IMAGE_TAG=sha-xxxxxxxxxxxx bash deploy.sh
```

Le serveur garde l'image en service et la précédente. Pour une plus ancienne, se connecter d'abord à ghcr.io (`docker login ghcr.io`) si le paquet est privé.

## Vérifier après le premier déploiement

- `https://web.atlight.fr` ouvre la page de connexion, avec un certificat valide pour `web.atlight.fr`.
- `http://web.atlight.fr` redirige vers `https://`.
- `https://web.atlight.fr/api/health` renvoie `{"status":"ok","version":"sha-…"}`, avec le commit déployé.
- `https://atlight.fr` (backend) répond comme avant.
- Connexion avec un compte de test : le BFF joint bien le backend depuis le conteneur.
- `curl -I http://157.173.118.249:3100` échoue depuis l'extérieur : le conteneur n'est joignable que par nginx.

## Dépannage

| Symptôme dans la CI                                | Piste                                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Certificat refusé`                                | Port 80 fermé ou DNS : voir « Ouvrir le port 80 »                                  |
| `Le conteneur … ne répond pas sur /api/health`     | `docker logs atlight-web` sur le serveur ; l'image précédente a été remise         |
| `nginx refuse la nouvelle configuration`           | Sortie de `nginx -t` dans le log ; corriger `deploy/nginx/site.conf`               |
| `Host key verification failed`                     | Mettre à jour `CONTABO_SSH_KNOWN_HOSTS` (`ssh-keyscan 157.173.118.249`)            |
| Échec de `docker compose pull` (`denied`)          | Paquet GHCR non relié au dépôt : _Package settings → Manage Actions access_        |
| Vérification publique en échec, tout le reste vert | `curl -v https://web.atlight.fr/api/health` ; pare-feu du 443, configuration nginx |

## Fichiers

| Fichier                       | Rôle                                                            |
| ----------------------------- | --------------------------------------------------------------- |
| `.github/workflows/ci.yml`    | Pipeline CI/CD                                                  |
| `Dockerfile`, `.dockerignore` | Image de production (sortie `standalone`, utilisateur non root) |
| `deploy/compose.yml`          | Service `atlight-web` sur le VPS                                |
| `deploy/deploy.sh`            | Déploiement, sonde de santé, retour arrière, nginx, certificat  |
| `deploy/nginx/site.conf`      | Site HTTPS de `web.atlight.fr`                                  |
| `deploy/nginx/acme.conf`      | Site provisoire, le temps d'obtenir le premier certificat       |
| `src/app/api/health/route.ts` | Sonde de santé (`{ status, version }`)                          |
