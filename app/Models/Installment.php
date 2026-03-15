<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Installment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'fee_structure_id',
        'name',
        'installment_number',
        'amount',
    ];

    protected $casts = [
        'amount' => 'float',
        'installment_number' => 'integer',
    ];

    /**
     * Get the fee structure that owns the installment.
     */
    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }
}
