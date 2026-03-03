<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AcademicYear extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'year',
        'start_date',
        'end_date',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

}

