<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'employee_number',
        'job_title',
        'department',
        'contract_type',
        'hire_date',
        'end_date',
        'base_salary',
        'payment_method',
        'bank_name',
        'bank_account',
        'momo_number',
        'cnss_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'base_salary' => 'float',
        'hire_date'   => 'date',
        'end_date'    => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    /** Nom complet de l'employé (via le compte utilisateur). */
    public function fullName(): string
    {
        return trim(($this->user?->firstname ?? '') . ' ' . ($this->user?->lastname ?? ''));
    }
}
