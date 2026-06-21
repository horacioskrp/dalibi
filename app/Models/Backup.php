<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Backup extends Model
{
    use HasUuids;

    protected $fillable = [
        'filename', 'path', 'disk', 'format', 'size', 'status', 'error', 'scheduled', 'created_by',
    ];

    protected $casts = [
        'size'      => 'integer',
        'scheduled' => 'boolean',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
