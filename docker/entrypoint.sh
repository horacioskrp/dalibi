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
