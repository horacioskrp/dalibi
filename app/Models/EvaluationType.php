<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get all evaluations for this type.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'evaluation_type_id');
    }
}
