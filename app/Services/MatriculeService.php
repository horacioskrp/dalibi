<?php

namespace App\Services;

use App\Constants\Roles;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MatriculeService
{
    protected const ROLE_PREFIXES = [
        Roles::ADMINISTRATOR => 'ADM',
        Roles::DIRECTOR      => 'DIR',
        Roles::TEACHER       => 'PROF',
        Roles::ACCOUNTING    => 'COMPT',
        Roles::SECRETARIAT   => 'SEC',
    ];

    public function generateUserMatricule(string $role): string
    {
        $prefix   = self::ROLE_PREFIXES[$role] ?? 'USR';
        $year     = date('y');
        $sequence = $this->getNextUserSequence($prefix, $year);

        return "{$prefix}{$year}" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    public function generateStudentMatricule(?string $schoolCode = null): string
    {
        $year       = date('y');
        $schoolCode = $schoolCode ? substr(strtoupper($schoolCode), 0, 3) : 'ECO';
        $sequence   = $this->getNextStudentSequence($schoolCode, $year);

        return "{$schoolCode}STU{$year}" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    protected function getNextUserSequence(string $prefix, string $year): int
    {
        // lockForUpdate() requires an active transaction; the caller must wrap in DB::transaction()
        return User::where('natricule', 'like', "{$prefix}{$year}%")
            ->lockForUpdate()
            ->count() + 1;
    }

    protected function getNextStudentSequence(string $schoolCode, string $year): int
    {
        $schoolCode = strtoupper(substr($schoolCode, 0, 3));
        $pattern    = "{$schoolCode}STU{$year}%";

        // lockForUpdate() prevents duplicate sequences under concurrent inserts
        return Student::where('matricule', 'like', $pattern)
            ->lockForUpdate()
            ->count() + 1;
    }

    public function parseMatricule(string $matricule): ?array
    {
        if (preg_match('/^([A-Z]{3,5})(\d{2})(\d{3})$/', $matricule, $matches)) {
            return [
                'prefix'   => $matches[1],
                'year'     => '20' . $matches[2],
                'sequence' => (int) $matches[3],
            ];
        }

        return null;
    }

    public function generateRandomMatricule(string $prefix = 'USR'): string
    {
        do {
            $matricule = "{$prefix}-" . time() . '-' . Str::random(8);
        } while (User::where('natricule', $matricule)->exists());

        return $matricule;
    }

    public function getRoleFromMatricule(string $matricule): ?string
    {
        // Extrait la partie alphabétique (préfixe) — gère PROF, COMPT, etc.
        if (! preg_match('/^([A-Z]+)/', $matricule, $matches)) {
            return null;
        }

        $role = array_search($matches[1], self::ROLE_PREFIXES, true);

        return $role !== false ? $role : null;
    }

    public function matriculeExists(string $matricule): bool
    {
        return User::where('natricule', $matricule)->exists();
    }

    public function isValidMatriculeFormat(string $matricule): bool
    {
        return (bool) preg_match('/^[A-Z]{3,5}\d{2}\d{3}$/', $matricule);
    }

    public static function getPrefixes(): array
    {
        return self::ROLE_PREFIXES;
    }
}
