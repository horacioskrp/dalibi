<?php

namespace App\Policies;

use App\Models\AbsencePermission;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AbsencePermissionPolicy
{
    public function view(User $user, AbsencePermission $absencePermission): bool
    {
        return $user->can('view_absence_permissions');
    }

    public function delete(User $user, AbsencePermission $absencePermission): bool
    {
        return $user->can('delete_absence_permissions');
    }

    /**
     * Traiter (approuver/rejeter) une demande de permission d'absence.
     *
     * Règle métier centralisée : seulement si elle est encore « en attente ».
     */
    public function review(User $user, AbsencePermission $absencePermission): Response
    {
        if (! $user->can('review_absence_permissions')) {
            return Response::deny("Vous n'avez pas l'autorisation de traiter les demandes.");
        }

        return $absencePermission->status === 'pending'
            ? Response::allow()
            : Response::deny('Cette demande a déjà été traitée.');
    }
}
