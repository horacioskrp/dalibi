<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayrollSetting extends Model
{
    use HasUuids;

    protected $fillable = [
        'seniority_enabled',
        'seniority_rate_per_year',
        'seniority_cap_percent',
    ];

    protected $casts = [
        'seniority_enabled'       => 'boolean',
        'seniority_rate_per_year' => 'float',
        'seniority_cap_percent'   => 'float',
    ];

    /** Réglages courants (singleton) — créés avec les valeurs par défaut si absents. */
    public static function current(): self
    {
        return static::firstOrCreate([]);
    }
}
