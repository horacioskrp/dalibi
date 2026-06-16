<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FileStorageSetting extends Model
{
    protected $primaryKey = 'key';
    protected $keyType    = 'string';
    public    $incrementing = false;

    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("file_storage_{$key}", 3600, function () use ($key, $default) {
            return static::find($key)?->value ?? $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("file_storage_{$key}");
    }

    public static function allSettings(): array
    {
        return static::all()->pluck('value', 'key')->toArray();
    }

    public static function s3Config(): array
    {
        return [
            'driver'                  => 's3',
            'key'                     => static::get('s3_key'),
            'secret'                  => static::get('s3_secret'),
            'region'                  => static::get('s3_region', 'auto'),
            'bucket'                  => static::get('s3_bucket'),
            'url'                     => static::get('s3_url'),
            'endpoint'                => static::get('s3_endpoint'),
            'use_path_style_endpoint' => true,
            'visibility'              => 'public',
            'throw'                   => true,
        ];
    }
}
