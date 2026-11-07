#!/usr/bin/env bash
# Déploiement du web Atlight sur le VPS. Lancé par la CI (job « Déploiement »), relançable à la main :
#   cd ~/atlight-web && WEB_IMAGE=ghcr.io/nde18/atlight-frontend-web WEB_IMAGE_TAG=sha-xxxxxxxxxxxx bash deploy.sh
#
# 1. Télécharge l'image, remplace le conteneur et attend la sonde /api/health ;
#    en cas d'échec, revient à l'image précédente.
# 2. Installe ou met à jour la configuration nginx du domaine ; au premier passage, obtient le
#    certificat Let's Encrypt (le domaine doit pointer ici et le port 80 être ouvert).
#
# Variables : WEB_IMAGE et WEB_IMAGE_TAG (obligatoires), WEB_DOMAIN (web.atlight.fr), WEB_PORT (3100),
# LETSENCRYPT_EMAIL (facultatif). Image privée : GHCR_USER, et le jeton sur l'entrée standard.
set -euo pipefail

: "${WEB_IMAGE:?WEB_IMAGE manquant}"
: "${WEB_IMAGE_TAG:?WEB_IMAGE_TAG manquant}"
DOMAIN="${WEB_DOMAIN:-web.atlight.fr}"
PORT="${WEB_PORT:-3100}"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

SUDO=""
[ "$(id -u)" -eq 0 ] || SUDO="sudo"

log() { printf '\n==> %s\n' "$*"; }
compose() { docker compose -f "$DIR/compose.yml" --env-file "$DIR/.env" "$@"; }

write_env() {
  (
    umask 077
    printf 'WEB_IMAGE=%s\nWEB_IMAGE_TAG=%s\nWEB_PORT=%s\n' "$WEB_IMAGE" "$1" "$PORT" >"$DIR/.env"
  )
}

# Attend que le conteneur réponde avec la version $1 (60 s au plus).
healthy() {
  local body=""
  for _ in $(seq 1 30); do
    body="$(curl -fsS --max-time 3 "http://127.0.0.1:$PORT/api/health" 2>/dev/null || true)"
    if [[ "$body" == *"\"version\":\"$1\""* ]]; then return 0; fi
    sleep 2
  done
  return 1
}

command -v docker >/dev/null 2>&1 || { echo "Docker est requis sur le serveur." >&2; exit 1; }

PREVIOUS_TAG=""
[ ! -f "$DIR/.env" ] || PREVIOUS_TAG="$(sed -n 's/^WEB_IMAGE_TAG=//p' "$DIR/.env")"

# --- 1. Conteneur -----------------------------------------------------------------------------

if [ -n "${GHCR_USER:-}" ] && [ ! -t 0 ]; then
  log "Connexion à ghcr.io"
  docker login ghcr.io -u "$GHCR_USER" --password-stdin
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

rollback() {
  echo "Le conteneur $WEB_IMAGE_TAG ne répond pas sur /api/health." >&2
  compose logs --tail 100 web >&2 || true
  if [ -n "$PREVIOUS_TAG" ] && [ "$PREVIOUS_TAG" != "$WEB_IMAGE_TAG" ]; then
    log "Retour à l'image précédente ($PREVIOUS_TAG)"
    write_env "$PREVIOUS_TAG"
    compose up -d web && healthy "$PREVIOUS_TAG" || echo "L'image précédente ne répond pas non plus." >&2
  fi
  exit 1
}

log "Image $WEB_IMAGE:$WEB_IMAGE_TAG"
write_env "$WEB_IMAGE_TAG"
if ! compose pull web; then
  # Le conteneur en service n'a pas changé : le fichier .env doit continuer à le décrire.
  [ -z "$PREVIOUS_TAG" ] || write_env "$PREVIOUS_TAG"
  exit 1
fi
compose up -d --remove-orphans web || rollback
healthy "$WEB_IMAGE_TAG" || rollback
echo "Conteneur prêt sur 127.0.0.1:$PORT"

# --- 2. nginx et certificat -------------------------------------------------------------------

if [ -d /etc/nginx/sites-enabled ]; then
  SITE="/etc/nginx/sites-available/$DOMAIN"
  LINK="/etc/nginx/sites-enabled/$DOMAIN"
else
  SITE="/etc/nginx/conf.d/$DOMAIN.conf"
  LINK=""
fi
CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

# Installe nginx/$1 si la configuration a changé ; nginx n'est rechargé que si `nginx -t` l'accepte,
# sinon l'ancienne configuration est remise : le site du backend (atlight.fr) n'est jamais touché.
install_site() {
  local new backup=""
  new="$(mktemp)"
  sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__PORT__/$PORT/g" "$DIR/nginx/$1" >"$new"
  if cmp -s "$new" "$SITE"; then
    rm -f "$new"
    echo "nginx : configuration de $DOMAIN inchangée"
    return 0
  fi
  if [ -f "$SITE" ]; then
    backup="$(mktemp)"
    cp "$SITE" "$backup"
  fi
  $SUDO install -m 644 "$new" "$SITE"
  rm -f "$new"
  [ -z "$LINK" ] || $SUDO ln -sf "$SITE" "$LINK"
  if ! $SUDO nginx -t; then
    echo "nginx refuse la nouvelle configuration : retour à la précédente." >&2
    if [ -n "$backup" ]; then
      $SUDO install -m 644 "$backup" "$SITE"
    else
      $SUDO rm -f "$SITE" ${LINK:+"$LINK"}
    fi
    return 1
  fi
  $SUDO systemctl reload nginx
  rm -f "$backup"
  echo "nginx : $1 appliqué à $DOMAIN"
}

if ! $SUDO test -f "$CERT"; then
  log "Certificat Let's Encrypt pour $DOMAIN"
  if ! command -v certbot >/dev/null 2>&1; then
    $SUDO apt-get update -y
    $SUDO apt-get install -y certbot
  fi
  $SUDO mkdir -p /var/www/certbot
  if command -v ufw >/dev/null 2>&1 && $SUDO ufw status | grep -q "Status: active" &&
    ! $SUDO ufw status | grep -qE "^(80(/tcp)?|80,443/tcp|Nginx (Full|HTTP))[[:space:]]+ALLOW"; then
    echo "Attention : ufw ne semble pas autoriser le port 80 ; si le certificat est refusé :" \
      "sudo ufw allow 80/tcp" >&2
  fi
  install_site acme.conf
  email=(--register-unsafely-without-email)
  [ -z "${LETSENCRYPT_EMAIL:-}" ] || email=(-m "$LETSENCRYPT_EMAIL")
  if ! $SUDO certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
    --non-interactive --agree-tos "${email[@]}" --deploy-hook "systemctl reload nginx"; then
    echo "Certificat refusé : $DOMAIN doit pointer vers ce serveur et le port 80 être joignable" \
      "depuis Internet (ufw allow 80/tcp, pare-feu Contabo)." >&2
    exit 1
  fi
fi

log "nginx"
install_site site.conf
# `systemctl reload` rend la main avant que nginx ait chargé la nouvelle configuration :
# on laisse quelques secondes avant de conclure (sinon l'ancien certificat peut encore répondre).
for i in $(seq 1 10); do
  if curl -fsS --max-time 10 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/health" >/dev/null; then
    echo "https://$DOMAIN répond"
    break
  fi
  [ "$i" -lt 10 ] || exit 1
  sleep 2
done

# --- Ménage : on garde l'image en service et la précédente (retour arrière) --------------------

docker image ls "$WEB_IMAGE" --format '{{.Tag}}' | while read -r tag; do
  case " $WEB_IMAGE_TAG $PREVIOUS_TAG " in
    *" $tag "*) ;;
    *) docker image rm "$WEB_IMAGE:$tag" >/dev/null 2>&1 || true ;;
  esac
done

log "Déployé : $WEB_IMAGE:$WEB_IMAGE_TAG"
