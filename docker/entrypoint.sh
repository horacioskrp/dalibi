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

exec "$@"
