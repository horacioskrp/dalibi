<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassSubject extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'class_id',
        'subject_id',
        'coefficient',
        'academic_year_id',
    ];

    protected $casts = [
        'coefficient' => 'decimal:2',
    ];

    /**
     * Get the class this assignment belongs to.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    /**
     * Get the subject for this assignment.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the academic year for this class-subject assignment.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get all grades for this class-subject combination.
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}
