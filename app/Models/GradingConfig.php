<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradingConfig extends Model
{
    use HasUuids;

    protected $fillable = [
        'school_id',
        'name',
        'is_active',
        'passing_score',
        'default_max_score',
        'term1_weight',
        'term2_weight',
        'term3_weight',
        'round_precision',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'passing_score'    => 'float',
        'default_max_score'=> 'float',
        'term1_weight'     => 'float',
        'term2_weight'     => 'float',
        'term3_weight'     => 'float',
        'round_precision'  => 'integer',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
