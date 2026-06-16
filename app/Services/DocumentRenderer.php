<?php

namespace App\Services;

use App\Models\DocumentTemplate;
use App\Models\School;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class DocumentRenderer
{
    /**
     * Catalogue des variables disponibles, pour l'éditeur (UI).
     *
     * @return array<string, array{label: string, variables: array<string, string>}>
     */
    public static function variableCatalog(): array
    {
        return [
            'ecole' => [
                'label' => 'École',
                'variables' => [
                    'ecole.nom'    => 'Nom de l\'école',
                    'ecole.terme'  => 'Terme (ex. République Togolaise)',
                    'ecole.devise' => 'Devise',
                    'ecole.bp'     => 'Boîte postale',
                    'ecole.ville'  => 'Ville',
                    'ecole.telephone' => 'Téléphone',
                    'ecole.email'  => 'E-mail',
                ],
            ],
            'eleve' => [
                'label' => 'Élève',
                'variables' => [
                    'eleve.nom_complet'    => 'Nom complet',
                    'eleve.nom'            => 'Nom',
                    'eleve.prenom'         => 'Prénom(s)',
                    'eleve.matricule'      => 'Matricule',
                    'eleve.date_naissance' => 'Date de naissance',
                    'eleve.lieu_naissance' => 'Lieu de naissance',
                    'eleve.sexe'           => 'Sexe',
                    'eleve.nationalite'    => 'Nationalité',
                ],
            ],
            'scolarite' => [
                'label' => 'Scolarité',
                'variables' => [
                    'classe.nom'     => 'Classe',
                    'annee_scolaire' => 'Année scolaire',
                ],
            ],
            'document' => [
                'label' => 'Document',
                'variables' => [
                    'date.aujourdhui'  => 'Date du jour',
                    'date.lieu'        => 'Fait à (ville)',
                    'document.reference' => 'N° de référence',
                    'signataire.titre' => 'Titre du signataire',
                ],
            ],
        ];
    }

    /**
     * Construit la table des valeurs pour un élève donné.
     *
     * @return array<string, string>
     */
    public function resolveVariables(
        School $school,
        ?Student $student = null,
        array $extra = []
    ): array {
        $vars = [
            'ecole.nom'       => $school->name ?? '',
            'ecole.terme'     => $school->terme ?? 'République Togolaise',
            'ecole.devise'    => $school->devise ?? '',
            'ecole.bp'        => $school->po_box ?? '',
            'ecole.ville'     => $school->city ?? '',
            'ecole.telephone' => $school->phone ?? '',
            'ecole.email'     => $school->email ?? '',
            'date.aujourdhui' => Carbon::now()->locale('fr')->isoFormat('D MMMM YYYY'),
            'date.lieu'       => $school->city ?? '',
        ];

        if ($student) {
            $vars += [
                'eleve.nom_complet'    => trim(($student->lastname ?? '') . ' ' . ($student->firstname ?? '')),
                'eleve.nom'            => $student->lastname ?? '',
                'eleve.prenom'         => $student->firstname ?? '',
                'eleve.matricule'      => $student->matricule ?? '',
                'eleve.date_naissance' => $student->birth_date
                    ? Carbon::parse($student->birth_date)->locale('fr')->isoFormat('D MMMM YYYY')
                    : '',
                'eleve.lieu_naissance' => $student->place_of_birth ?? '',
                'eleve.sexe'           => match ($student->gender) {
                    'male'   => 'Masculin',
                    'female' => 'Féminin',
                    default  => '',
                },
                'eleve.nationalite'    => $student->nationality ?? '',
            ];
        }

        return array_merge($vars, $extra);
    }

    /**
     * Remplace les variables {{ ... }} dans un contenu HTML.
     */
    public function interpolate(string $content, array $variables): string
    {
        return preg_replace_callback('/\{\{\s*([\w.]+)\s*\}\}/', function ($m) use ($variables) {
            return $variables[$m[1]] ?? '';
        }, $content);
    }

    /**
     * Rend le document complet (en-tête + corps + signature) en HTML prêt pour le PDF.
     */
    public function render(DocumentTemplate $template, array $variables): string
    {
        $body      = $this->interpolate($template->content ?? '', $variables);
        $header    = $template->header_enabled ? $this->renderHeader($template, $variables) : '';
        $signature = $template->show_signature ? $this->renderSignature($template, $variables) : '';

        $css = $this->baseCss();

        return <<<HTML
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="utf-8"><style>{$css}</style></head>
        <body>
            {$header}
            <main class="doc-body">{$body}</main>
            {$signature}
        </body>
        </html>
        HTML;
    }

    protected function renderHeader(DocumentTemplate $template, array $variables): string
    {
        $terme  = e($variables['ecole.terme'] ?? '');
        $devise = e($variables['ecole.devise'] ?? '');
        $nom    = e($variables['ecole.nom'] ?? '');
        $coords = collect([
            $variables['ecole.bp'] ?? null,
            $variables['ecole.ville'] ?? null,
            $variables['ecole.telephone'] ?? null,
        ])->filter()->implode(' – ');

        // Logo de l'école si disponible
        $logoHtml = '';
        $logoPath = $template->school?->logo;
        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            $absolute = Storage::disk('public')->path($logoPath);
            $logoHtml = '<img class="doc-logo" src="' . $absolute . '" alt="logo">';
        }

        return <<<HTML
        <header class="doc-header">
            <div class="doc-header-top">
                <div class="doc-terme">{$terme}</div>
                <div class="doc-devise">{$devise}</div>
            </div>
            <div class="doc-header-school">
                {$logoHtml}
                <div class="doc-school-info">
                    <div class="doc-school-name">{$nom}</div>
                    <div class="doc-school-coords">{$coords}</div>
                </div>
            </div>
            <hr class="doc-rule">
        </header>
        HTML;
    }

    protected function renderSignature(DocumentTemplate $template, array $variables): string
    {
        $lieu  = e($variables['date.lieu'] ?? '');
        $date  = e($variables['date.aujourdhui'] ?? '');
        $titre = e($template->signatory_title ?: ($variables['signataire.titre'] ?? 'Le Directeur'));

        return <<<HTML
        <footer class="doc-signature">
            <div class="doc-sign-place">Fait à {$lieu}, le {$date}</div>
            <div class="doc-sign-title">{$titre}</div>
            <div class="doc-sign-space"></div>
        </footer>
        HTML;
    }

    protected function baseCss(): string
    {
        return <<<CSS
        * { box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; color: #1a1a1a; font-size: 13px; line-height: 1.6; margin: 0; }
        .doc-header { text-align: center; margin-bottom: 24px; }
        .doc-header-top { margin-bottom: 12px; }
        .doc-terme { font-weight: bold; text-transform: uppercase; font-size: 14px; }
        .doc-devise { font-style: italic; font-size: 11px; color: #444; }
        .doc-header-school { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 10px; }
        .doc-logo { height: 64px; width: 64px; object-fit: contain; }
        .doc-school-name { font-weight: bold; font-size: 15px; text-transform: uppercase; }
        .doc-school-coords { font-size: 10px; color: #555; }
        .doc-rule { border: none; border-top: 2px solid #1a1a1a; margin: 12px auto 0; width: 40%; }
        .doc-body { margin: 28px 0; }
        .doc-body h1, .doc-body h2 { text-align: center; text-transform: uppercase; }
        .doc-signature { margin-top: 48px; text-align: right; }
        .doc-sign-place { margin-bottom: 6px; }
        .doc-sign-title { font-weight: bold; }
        .doc-sign-space { height: 70px; }
        CSS;
    }
}
