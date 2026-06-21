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

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Code source (filtré par .dockerignore)
COPY . .

# Environnement minimal pour booter artisan pendant le build
RUN cp -n .env.example .env 2>/dev/null || true

# Dépendances PHP (production)
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

# Clé temporaire (le build ne sert rien publiquement ; APP_KEY réel fourni au runtime)
RUN php artisan key:generate --force

# Dépendances front + build des assets (Wayfinder génère les helpers de routes via php artisan)
RUN npm ci && npm run build

# Artefacts inutiles au runtime
RUN rm -rf node_modules .env

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

EXPOSE 80

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
