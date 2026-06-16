<?php

namespace App\Policies;

use App\Constants\Roles;
use App\Models\EvaluationType;
use App\Models\User;

class EvaluationTypePolicy
{
    public function create(User $user): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]);
    }

    public function update(User $user, EvaluationType $evaluationType): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]);
    }

    public function delete(User $user, EvaluationType $evaluationType): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]);
    }
}
