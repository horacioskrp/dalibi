<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentMedicalInfo extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'blood_group',
        'allergies',
        'vaccinations',
        'emergency_contact_name',
        'emergency_contact_phone',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
