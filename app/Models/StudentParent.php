<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentParent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'father_firstname',
        'father_lastname',
        'father_profession',
        'father_phone',
        'mother_firstname',
        'mother_lastname',
        'mother_profession',
        'mother_phone',
        'email',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
