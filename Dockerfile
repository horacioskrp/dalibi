# syntax=docker/dockerfile:1

########################################################################
# Stage 1 — Build : PHP + Node (Composer, Vite, Wayfinder)
# Wayfinder appelle `php artisan` pendant `vite build` : PHP est requis ici.
########################################################################
FROM php:8.3-cli-alpine AS build

# Dépendances système + extensions PHP nécessaires au build
RUN apk add --no-cache \
        git unzip nodejs npm \
        icu-libs libzip libpng libjpeg-turbo freetype postgresql-libs oniguruma \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
        icu-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev postgresql-dev oniguruma-dev linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql mbstring bcmath gd zip intl exif pcntl \
    && apk del .build-deps

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 1) Dépendances PHP — couche mise en cache tant que composer.{json,lock} ne changent pas.
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts --no-autoloader

# 2) Dépendances front — couche mise en cache tant que package*.json ne changent pas.
COPY package.json package-lock.json ./
RUN npm ci

# 3) Code source (filtré par .dockerignore)
COPY . .

# 4) Autoload optimisé (déclenche package:discover) + env minimal + clé temporaire + build des assets.
RUN cp -n .env.example .env 2>/dev/null || true \
    && composer dump-autoload --no-dev --optimize \
    && php artisan key:generate --force \
    && npm run build \
    && rm -rf node_modules .env

########################################################################
# Stage 2 — Runtime : PHP-FPM + Nginx (non-root, Kubernetes-ready)
########################################################################
FROM php:8.3-fpm-alpine AS runtime

RUN apk add --no-cache \
        nginx supervisor \
        icu-libs libzip libpng libjpeg-turbo freetype postgresql-libs oniguruma \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
        icu-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev postgresql-dev oniguruma-dev linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql mbstring bcmath gd zip intl exif pcntl opcache \
    && apk del .build-deps

# Configuration
COPY docker/php.ini          /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/php-fpm.conf     /usr/local/etc/php-fpm.d/zz-app.conf
COPY docker/nginx.conf       /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh    /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /var/www/html

# Application complète (vendor + assets compilés) depuis l'étape build
COPY --from=build /app /var/www/html

# Lien de stockage public (créé au build, l'utilisateur runtime n'écrit pas dans public/)
# + permissions des dossiers inscriptibles pour l'utilisateur non-root www-data.
RUN ln -sf storage/app/public public/storage \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Exécution NON-ROOT (compatible PodSecurity « restricted » : runAsNonRoot).
USER www-data

# Port non privilégié (>1024) servi par nginx.
EXPOSE 8080

# Sonde de santé (locale/Docker ; sous Kubernetes, utilisez des probes httpGet /up).
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/up >/dev/null 2>&1 || exit 1

ENTRYPOINT ["entrypoint"]
# Rôle par défaut = web (php-fpm + nginx). Pour les autres rôles, surchargez la commande :
#   worker     : php artisan queue:work --max-time=3600
#   scheduler  : php artisan schedule:work   (un seul réplica)
#   migration  : php artisan migrate --force
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
