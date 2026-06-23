#!/bin/sh
set -e

cd /var/www/html

# Lien symbolique de stockage public (idempotent)
php artisan storage:link 2>/dev/null || true

# Caches optimisés avec l'environnement réel du conteneur.
# NB : pas de `route:cache` — le fichier de routes contient des closures.
php artisan config:cache
php artisan view:cache

# Migrations optionnelles (RUN_MIGRATIONS=true)
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "→ Exécution des migrations…"
    php artisan migrate --force
fi

# Seeding
# - SEED_DATABASE=true  : seed GLOBAL (rôles/permissions + données de démo : élèves, comptes de test)
# - sinon, si SEED_PERMISSIONS=true (ou migrations lancées) : on garantit au minimum les rôles & permissions
if [ "${SEED_DATABASE:-false}" = "true" ]; then
    echo "→ Seed global (démo)…"
    php artisan db:seed --force
elif [ "${SEED_PERMISSIONS:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "→ Synchronisation des rôles & permissions…"
    php artisan db:seed --class=RolesAndPermissionsSeeder --force
fi

exec "$@"
