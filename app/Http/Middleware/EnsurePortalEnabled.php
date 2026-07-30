<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verrou global de l'espace parents/élèves. L'accès au portail est conditionné
 * par le drapeau School::portal_enabled : s'il est désactivé, aucune route du
 * portail (connexion comprise) ne répond. Application mono-école.
 */
class EnsurePortalEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $enabled = School::query()->value('portal_enabled');

        // Aucune école configurée => on considère le portail fermé.
        if (! $enabled) {
            return response()->json([
                'message' => "L'accès au portail est actuellement désactivé par l'établissement.",
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $next($request);
    }
}
