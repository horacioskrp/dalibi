<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Visualiseur de la documentation API (Redoc) — réservé aux environnements
 * de développement. En production, toutes les actions renvoient 404 :
 * la documentation décrit l'intégralité de la surface d'API et ne doit pas
 * être exposée publiquement.
 */
class ApiDocsController extends Controller
{
    public function __construct()
    {
        abort_unless($this->enabled(), 404);
    }

    /** Activé en local / développement, ou si API_DOCS_ENABLED=true. */
    private function enabled(): bool
    {
        return app()->environment(['local', 'development'])
            || (bool) config('app.api_docs_enabled', false);
    }

    public function index(): Response
    {
        $html = <<<'HTML'
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="robots" content="noindex, nofollow" />
            <title>Dalibi — API Portail (documentation)</title>
            <style>body { margin: 0; padding: 0; }</style>
        </head>
        <body>
            <redoc spec-url="/docs/api/openapi.yaml"></redoc>
            <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
        </html>
        HTML;

        return response($html)->header('X-Robots-Tag', 'noindex, nofollow');
    }

    public function spec(): BinaryFileResponse
    {
        return response()->file(base_path('docs/api/openapi.yaml'), [
            'Content-Type' => 'application/yaml',
        ]);
    }
}
