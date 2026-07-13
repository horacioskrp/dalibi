<?php

namespace App\Policies;

use App\Models\EvaluationType;
use App\Models\User;

class EvaluationTypePolicy
{
    public function create(User $user): bool
    {
        return $user->can('create_evaluation_types');
    }

    public function update(User $user, EvaluationType $evaluationType): bool
    {
        return $user->can('edit_evaluation_types');
    }

    public function delete(User $user, EvaluationType $evaluationType): bool
    {
        return $user->can('delete_evaluation_types');
    }
}
