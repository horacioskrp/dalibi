<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeStructure extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'academic_year_id',
        'fee_category_id',
        'class_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    /**
     * Get the academic year that owns the fee structure.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get the fee category that owns the fee structure.
     */
    public function feeCategory(): BelongsTo
    {
        return $this->belongsTo(FeeCategorie::class);
    }

    /**
     * Get the classroom that owns the fee structure.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }
}
