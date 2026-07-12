<?php

namespace App\Policies;

use App\Models\NoteReclamation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NoteReclamationPolicy
{
    public function view(User $user, NoteReclamation $noteReclamation): bool
    {
        return $user->can('view_note_reclamations');
    }

    /**
     * Traiter (approuver/rejeter) une réclamation.
     *
     * Règle métier centralisée : seulement si elle est encore « en attente ».
     */
    public function review(User $user, NoteReclamation $noteReclamation): Response
    {
        if (! $user->can('review_note_reclamations')) {
            return Response::deny("Vous n'avez pas l'autorisation de traiter les réclamations.");
        }

        return $noteReclamation->status === 'pending'
            ? Response::allow()
            : Response::deny('Cette réclamation a déjà été traitée.');
    }
}
