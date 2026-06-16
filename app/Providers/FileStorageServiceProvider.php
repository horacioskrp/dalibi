<?php

namespace App\Providers;

use App\Models\FileStorageSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;

class FileStorageServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Ne pas tenter d'accéder à la DB pendant les migrations ou en console (artisan)
        if ($this->app->runningInConsole()) {
            return;
        }

        try {
            $driver = FileStorageSetting::get('driver', 'local');

            if ($driver === 's3') {
                config(['filesystems.disks.media' => FileStorageSetting::s3Config()]);
            } else {
                config(['filesystems.disks.media' => config('filesystems.disks.public')]);
            }

            // Le disque "media" est celui utilisé dans toute l'app pour les uploads
        } catch (\Throwable) {
            // Fallback silencieux si la table n'existe pas encore
            config(['filesystems.disks.media' => config('filesystems.disks.public')]);
        }
    }
}
