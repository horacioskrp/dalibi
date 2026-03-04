<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentInformation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'student_information';

    protected $fillable = [
        'student_id',
        'birth_certificate_number',
        'birth_certificate_issue_date',
        'birth_certificate_issue_place',
        'admission_type',
    ];

    protected $casts = [
        'birth_certificate_issue_date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
