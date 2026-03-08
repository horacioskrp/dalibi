<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'academic_period_id',
        'class_id',
        'evaluation_type_id',
        'name',
        'description',
        'date',
        'coefficient',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'coefficient' => 'decimal:2',
    ];

    /**
     * Get the academic period for this evaluation.
     */
    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class, 'academic_period_id');
    }

    /**
     * Get the class for this evaluation.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    /**
     * Get the evaluation type.
     */
    public function evaluationType(): BelongsTo
    {
        return $this->belongsTo(EvaluationType::class, 'evaluation_type_id');
    }
}
