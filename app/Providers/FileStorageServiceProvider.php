<?php

namespace App\Providers;

use App\Models\FileStorageSetting;
use Illuminate\Support\ServiceProvider;

class FileStorageServiceProvider extends ServiceProvider
{
    /**
     * Propage la configuration centralisée (Paramètres → Fichiers & Stockage)
     * vers le disque "media" utilisé par TOUS les uploads de l'app.
     *
     * Le disque "media" est défini par défaut (local) dans config/filesystems.php,
     * donc toujours disponible — y compris en console / file d'attente. Ici on ne
     * fait que le surcharger en S3 lorsque ce mode est sélectionné.
     */
    public function boot(): void
    {
        try {
            if (FileStorageSetting::get('driver', 'local') === 's3') {
                config(['filesystems.disks.media' => FileStorageSetting::s3Config()]);
            }
        } catch (\Throwable) {
            // Table absente (migrations en cours) : on garde le disque "media" local par défaut.
        }
    }
}
