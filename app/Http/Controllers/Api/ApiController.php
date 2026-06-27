<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Http\Request;

abstract class ApiController extends Controller
{
    /**
     * Résout l'élève cible UNIQUEMENT s'il est accessible au principal authentifié.
     * - Élève : seulement lui-même (403 sinon).
     * - Tuteur : seulement parmi ses enfants (404 sinon — pas de fuite d'existence).
     */
    protected function resolveStudent(Request $request, string $studentId): Student
    {
        $user = $request->user();

        if ($user instanceof Student) {
            abort_unless($user->id === $studentId, 403);

            return $user;
        }

        if ($user instanceof Guardian) {
            return $user->children()->findOrFail($studentId);
        }

        abort(403);
    }
}
