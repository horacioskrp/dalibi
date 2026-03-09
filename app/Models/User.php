<?php

/**
 * Projet : Système de Gestion Scolaire (SIGE) - Togo
 * Description : Gestion des élèves, des notes et des bulletins.
 * * Copyright (c) 2026 Kudayah Sassou Horacio Herve.
 * * Ce programme est un logiciel libre : vous pouvez le redistribuer et/ou le modifier 
 * selon les termes de la Licence Publique Générale GNU (GPL v3) telle que publiée 
 * par la Free Software Foundation.
 * * Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; 
 * sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN BUT PARTICULIER. 
 * Consultez la Licence Publique Générale GNU pour plus de détails.
 * * Vous devriez avoir reçu une copie de la Licence Publique Générale GNU 
 * avec ce programme. Sinon, voir <https://www.gnu.org/licenses/>.
 */

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\HasMatricule;
use App\Services\MatriculeService;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUuids, Notifiable, TwoFactorAuthenticatable, HasRoles, HasMatricule;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'natricule',
        'firstname',
        'lastname',
        'gender',
        'birth_date',
        'telephone',
        'profile',
        'email',
        'address',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'birth_date' => 'date',
        ];
    }

    /**
     * Get the user's full name
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->firstname} {$this->lastname}",
        );
    }

    /**
     * Check if user has a specific role among multiple roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->hasAnyRole($roles);
    }

    /**
     * Check if user is an administrator.
     */
    public function isAdministrator(): bool
    {
        return $this->hasRole('administrateur');
    }

    /**
     * Check if user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('enseignant');
    }

    /**
     * Check if user is accounting.
     */
    public function isAccounting(): bool
    {
        return $this->hasRole('comptabilité');
    }

    /**
     * Check if user is secretariat.
     */
    public function isSecretariat(): bool
    {
        return $this->hasRole('secrétariat');
    }

    /**
     * Check if user is a director.
     */
    public function isDirector(): bool
    {
        return $this->hasRole('directeur');
    }

    /**
     * Générer un matricule pour cet utilisateur basé sur son rôle
     *
     * @return string
     */
    public function generateMatricule(): string
    {
        $matriculeService = app(MatriculeService::class);

        // Obtenir le rôle principal de l'utilisateur
        $role = $this->roles?->first()?->name;

        if ($role) {
            return $matriculeService->generateUserMatricule($role);
        }

        // Fallback si pas de rôle assigné
        return $matriculeService->generateUserMatricule('administrator');
    }
}
