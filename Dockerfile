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
#    --no-scripts/--no-autoloader car le code source n'est pas encore présent.
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts --no-autoloader

# 2) Dépendances front — couche mise en cache tant que package*.json ne changent pas.
COPY package.json package-lock.json ./
RUN npm ci

# 3) Code source (filtré par .dockerignore)
COPY . .

# 4) Autoload optimisé (déclenche package:discover) + env minimal + clé temporaire + build des assets.
#    APP_KEY réel fourni au runtime ; la clé de build est jetée avec le .env.
RUN cp -n .env.example .env 2>/dev/null || true \
    && composer dump-autoload --no-dev --optimize \
    && php artisan key:generate --force \
    && npm run build \
    && rm -rf node_modules .env

########################################################################
# Stage 2 — Runtime : PHP-FPM + Nginx + Supervisor
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
COPY docker/php.ini         /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/nginx.conf      /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh   /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /var/www/html

# Application complète (vendor + assets compilés) depuis l'étape build
COPY --from=build /app /var/www/html

# Permissions des dossiers inscriptibles
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Lance par défaut le scheduler + le worker de file d'attente (cf. supervisord.conf).
# À passer à "false" sur les réplicas web supplémentaires (multi-instances).
ENV RUN_SCHEDULER=true \
    RUN_QUEUE=true

EXPOSE 80

# Sonde de santé (route Laravel /up). wget fourni par busybox (alpine).
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://127.0.0.1/up >/dev/null 2>&1 || exit 1

# Arrêt gracieux de php-fpm
STOPSIGNAL SIGQUIT

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
