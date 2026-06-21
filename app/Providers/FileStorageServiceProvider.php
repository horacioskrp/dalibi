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
                $s3 = FileStorageSetting::s3Config();
                config(['filesystems.disks.media' => $s3]);
                // Même backend S3, mais visibilité privée pour les fichiers sensibles
                config(['filesystems.disks.secure' => array_merge($s3, ['visibility' => 'private'])]);
            }
        } catch (\Throwable) {
            // Table absente (migrations en cours) : on garde les disques locaux par défaut.
        }
    }
}
