#!/bin/sh
set -e

cd /var/www/html

# ── Garde-fou : APP_KEY obligatoire ──────────────────────────────────────────
# Fourni soit par variable d'environnement, soit par un fichier .env monté.
if [ -z "${APP_KEY:-}" ] && [ ! -f .env ]; then
    echo "✗ APP_KEY non défini. Générez une clé (php artisan key:generate --show)" >&2
    echo "  et fournissez-la via l'environnement (APP_KEY=base64:…) ou un .env monté." >&2
    exit 1
fi

# ── Attente de la base de données (retry) ────────────────────────────────────
wait_for_db() {
    echo "→ Attente de la base de données…"
    i=0
    until php artisan db:show >/dev/null 2>&1; do
        i=$((i + 1))
        if [ "$i" -ge 30 ]; then
            echo "✗ Base de données injoignable après 60s." >&2
            return 1
        fi
        sleep 2
    done
    echo "  base de données disponible."
}

# Lien symbolique de stockage public (idempotent)
php artisan storage:link 2>/dev/null || true

# Caches optimisés avec l'environnement réel du conteneur.
# NB : pas de `route:cache` — le fichier de routes contient des closures.
php artisan config:cache
php artisan view:cache

# ── Migrations & seeding (attente BD si l'une des actions est demandée) ───────
if [ "${RUN_MIGRATIONS:-false}" = "true" ] \
    || [ "${SEED_DATABASE:-false}" = "true" ] \
    || [ "${SEED_REFERENCE:-false}" = "true" ] \
    || [ "${SEED_PERMISSIONS:-false}" = "true" ]; then
    wait_for_db
fi

# Migrations optionnelles (RUN_MIGRATIONS=true)
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "→ Exécution des migrations…"
    php artisan migrate --force
fi

# Seeding (du plus large au plus restreint)
# - SEED_DATABASE=true     : seed GLOBAL = référence + données de démo (élèves fictifs, comptes de test)
# - SEED_REFERENCE / RUN_MIGRATIONS : données de référence prod-safe
#   (rôles/permissions + catalogues : niveaux, types de classes, classes, matières,
#    catégories de frais, types d'évaluation, bourses) — seedées AUTOMATIQUEMENT au déploiement
# - SEED_PERMISSIONS=true  : rôles & permissions uniquement
if [ "${SEED_DATABASE:-false}" = "true" ]; then
    echo "→ Seed GLOBAL (référence + démo)…"
    php artisan db:seed --force
elif [ "${SEED_REFERENCE:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "→ Seed des données de référence (rôles/permissions + catalogues)…"
    php artisan db:seed --class=ReferenceDataSeeder --force
elif [ "${SEED_PERMISSIONS:-false}" = "true" ]; then
    echo "→ Synchronisation des rôles & permissions…"
    php artisan db:seed --class=RolesAndPermissionsSeeder --force
fi

exec "$@"
