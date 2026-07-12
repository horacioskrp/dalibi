<?php

namespace App\Policies;

use App\Models\Evaluation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EvaluationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view_evaluations');
    }

    public function view(User $user, Evaluation $evaluation): bool
    {
        return $user->can('view_evaluations');
    }

    public function update(User $user, Evaluation $evaluation): bool
    {
        return $user->can('edit_evaluations');
    }

    public function delete(User $user, Evaluation $evaluation): bool
    {
        return $user->can('delete_evaluations');
    }

    /**
     * Saisir/modifier les notes d'une évaluation.
     *
     * Règle métier centralisée : impossible sur une évaluation clôturée
     * (verrouillée) — il faut passer par une réclamation de notes.
     */
    public function enterMarks(User $user, Evaluation $evaluation): Response
    {
        if (! $user->can('create_marks')) {
            return Response::deny("Vous n'avez pas l'autorisation de saisir des notes.");
        }

        return $evaluation->locked_at === null
            ? Response::allow()
            : Response::deny('Cette évaluation est clôturée. Veuillez déposer une réclamation pour modifier les notes.');
    }
}
