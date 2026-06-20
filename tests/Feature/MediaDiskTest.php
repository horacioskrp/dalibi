<?php

namespace Tests\Feature;

use App\Models\FileStorageSetting;
use App\Providers\FileStorageServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MediaDiskTest extends TestCase
{
    use RefreshDatabase;

    public function test_media_disk_is_always_defined(): void
    {
        // Défini statiquement dans config/filesystems.php → disponible partout (même en console)
        $this->assertNotNull(config('filesystems.disks.media'));
        $this->assertEquals('local', config('filesystems.disks.media.driver'));
    }

    public function test_media_disk_switches_to_s3_when_configured(): void
    {
        FileStorageSetting::set('driver', 's3');
        FileStorageSetting::set('s3_key', 'KEY');
        FileStorageSetting::set('s3_secret', 'SECRET');
        FileStorageSetting::set('s3_bucket', 'mon-bucket');
        FileStorageSetting::set('s3_region', 'auto');

        // Re-propage la configuration centralisée
        (new FileStorageServiceProvider($this->app))->boot();

        $this->assertEquals('s3', config('filesystems.disks.media.driver'));
        $this->assertEquals('mon-bucket', config('filesystems.disks.media.bucket'));
    }
}
