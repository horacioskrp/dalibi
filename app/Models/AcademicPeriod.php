<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicPeriod extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'type',
        'order',
        'is_current',
        'academic_year_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    /**
     * Get the academic year that owns the period.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get evaluations attached to this academic period.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'academic_period_id');
    }
}
