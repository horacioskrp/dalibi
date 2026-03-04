<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schooling extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'class_id',
        'inscription_fee',
        'school_fee',
    ];

    protected $casts = [
        'inscription_fee' => 'float',
        'school_fee' => 'float',
    ];

    /**
     * Get the class associated with this schooling.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }
}
