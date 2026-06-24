<?php

namespace App\Services;

use App\Models\ReportCard;
use App\Models\School;

/**
 * Rend un bulletin scolaire fidèle (tableau Classe/Compo/Coeff/Moyenne/Rang),
 * coiffé de l'en-tête et du filigrane configurables ({@see DocumentRenderer}).
 */
class BulletinRenderer
{
    public function __construct(private readonly DocumentRenderer $documents)
    {
    }

    public function render(ReportCard $reportCard, School $school): string
    {
        $p = $reportCard->payload;

        $variables = $this->documents->resolveVariables($school, $reportCard->student);
        $header    = $this->documents->headerHtml($school, $variables);
        $watermark = $this->documents->watermarkHtml($school, $variables);

        $rows = '';
        foreach ($p['lines'] ?? [] as $line) {
            $rows .= $this->row($line);
        }

        $info = $this->infoBlock($p);
        $foot = $this->footBlock($p);
        $css  = $this->css();

        $title = e(mb_strtoupper('Bulletin — ' . ($p['period']['name'] ?? '')));

        return <<<HTML
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="utf-8"><style>{$css}</style></head>
        <body>
            {$watermark}
            {$header}
            <div class="bul-title">{$title}</div>
            {$info}
            <table class="bul-table">
                <thead>
                    <tr>
                        <th class="left">Matières</th>
                        <th>Classe</th>
                        <th>Compo</th>
                        <th>Coef</th>
                        <th>Moyenne</th>
                        <th>Rang</th>
                        <th class="left">Appréciations</th>
                        <th class="left">Professeur</th>
                    </tr>
                </thead>
                <tbody>
                    {$rows}
                </tbody>
            </table>
            {$foot}
        </body>
        </html>
        HTML;
    }

    private function row(array $line): string
    {
        $name   = e($line['subject'] ?? '');
        $classe = $this->num($line['classe'] ?? null);
        $compo  = $this->num($line['compo'] ?? null);
        $coeff  = $this->num($line['coefficient'] ?? null);
        $moy    = $this->num($line['moyenne'] ?? null);
        $rang   = $line['rang'] !== null ? e($this->ordinal((int) $line['rang'])) : '';
        $appr   = e($line['appreciation'] ?? '');
        $prof   = e($line['teacher'] ?? '');

        return <<<HTML
        <tr>
            <td class="left">{$name}</td>
            <td>{$classe}</td>
            <td>{$compo}</td>
            <td>{$coeff}</td>
            <td class="strong">{$moy}</td>
            <td>{$rang}</td>
            <td class="left small">{$appr}</td>
            <td class="left small">{$prof}</td>
        </tr>
        HTML;
    }

    private function infoBlock(array $p): string
    {
        $eleve    = e($p['student']['name'] ?? '');
        $classe   = e($p['class']['name'] ?? '');
        $effectif = e((string) ($p['effectif'] ?? ''));
        $absences = e((string) ($p['absences'] ?? '0'));
        $annee    = e($p['year'] ?? '');

        return <<<HTML
        <table class="bul-info">
            <tr>
                <td><strong>Nom de l'élève :</strong> {$eleve}</td>
                <td><strong>Classe :</strong> {$classe}</td>
                <td><strong>Effectif :</strong> {$effectif}</td>
            </tr>
            <tr>
                <td><strong>Année scolaire :</strong> {$annee}</td>
                <td><strong>Absences :</strong> {$absences}</td>
                <td></td>
            </tr>
        </table>
        HTML;
    }

    private function footBlock(array $p): string
    {
        $totalCoeff  = $this->num($p['total_coeff'] ?? null);
        $totalPoints = $this->num($p['total_points'] ?? null);
        $average     = $this->num($p['average'] ?? null);
        $rank        = isset($p['rank']) && $p['rank'] !== null ? e($this->ordinal((int) $p['rank'])) : '—';
        $mention     = e($p['mention'] ?? '—');
        $obs         = e($p['observations'] ?? '');

        return <<<HTML
        <table class="bul-total">
            <tr>
                <td class="left strong">TOTAL</td>
                <td class="strong">{$totalCoeff}</td>
                <td class="strong">{$totalPoints}</td>
            </tr>
        </table>

        <table class="bul-summary">
            <tr>
                <td><strong>Moyenne générale :</strong> <span class="big">{$average}/20</span></td>
                <td><strong>Rang :</strong> {$rank}</td>
                <td><strong>Mention :</strong> {$mention}</td>
            </tr>
        </table>

        <div class="bul-obs"><strong>Observations du Chef d'Établissement :</strong> {$obs}</div>

        <table class="bul-sign">
            <tr>
                <td>Le Titulaire<div class="sign-space"></div></td>
                <td>Le Chef d'Établissement<div class="sign-space"></div></td>
            </tr>
        </table>

        <div class="bul-nb">N.B. : Il n'est délivré qu'un seul bulletin.</div>
        HTML;
    }

    private function num(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        return rtrim(rtrim(number_format((float) $value, 2, ',', ''), '0'), ',');
    }

    private function ordinal(int $rank): string
    {
        return $rank === 1 ? '1er' : $rank . 'e';
    }

    private function css(): string
    {
        return <<<CSS
        * { box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; color: #1a1a1a; font-size: 11px; margin: 0; }
        .bul-title { text-align: center; font-weight: bold; font-size: 14px; text-transform: uppercase; margin: 6px 0 10px; }
        .bul-info { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .bul-info td { padding: 2px 4px; font-size: 11px; }
        .bul-table { width: 100%; border-collapse: collapse; }
        .bul-table th, .bul-table td { border: 1px solid #333; padding: 3px 5px; text-align: center; }
        .bul-table th { background: #eee; font-size: 10px; }
        .bul-table td.left, .bul-table th.left { text-align: left; }
        .bul-table td.small { font-size: 9px; font-style: italic; color: #444; }
        .bul-table td.strong, .strong { font-weight: bold; }
        .bul-total { width: 100%; border-collapse: collapse; }
        .bul-total td { border: 1px solid #333; padding: 3px 5px; text-align: center; }
        .bul-total td.left { text-align: left; width: 60%; }
        .bul-summary { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .bul-summary td { padding: 4px; font-size: 12px; }
        .bul-summary .big { font-size: 16px; font-weight: bold; }
        .bul-obs { margin-top: 12px; min-height: 28px; }
        .bul-sign { width: 100%; margin-top: 24px; }
        .bul-sign td { width: 50%; text-align: center; vertical-align: top; }
        .sign-space { height: 60px; }
        .bul-nb { margin-top: 16px; font-style: italic; font-size: 10px; }
        CSS;
    }
}
