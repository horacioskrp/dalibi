<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class Guardian extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'reset_token',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'email_verified_at' => 'datetime',
        'reset_expires_at'  => 'datetime',
        'password'          => 'hashed',
    ];

    /** Enfants liés à ce tuteur. */
    public function children(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'guardian_student')->withPivot('relationship');
    }

    public function fullName(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /** Émet un jeton (invitation ou réinitialisation) et renvoie sa valeur brute. */
    public function issueResetToken(int $days = 7): string
    {
        $raw = Str::random(48);

        $this->forceFill([
            'reset_token'      => hash('sha256', $raw),
            'reset_expires_at' => now()->addDays($days),
        ])->save();

        return $raw;
    }

    public function isResetTokenValid(string $raw): bool
    {
        return $this->reset_token !== null
            && $this->reset_expires_at?->isFuture()
            && hash_equals($this->reset_token, hash('sha256', $raw));
    }

    public function clearResetToken(): void
    {
        $this->forceFill(['reset_token' => null, 'reset_expires_at' => null])->save();
    }
}

