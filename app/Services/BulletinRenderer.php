<?php

namespace App\Services;

use App\Models\BulletinTemplate;
use App\Models\ReportCard;
use App\Models\School;

/**
 * Rend un bulletin scolaire à partir d'un modèle de colonnes configurable
 * (figé dans le snapshot {@see ReportCard}), coiffé de l'en-tête et du filigrane configurables.
 */
class BulletinRenderer
{
    public function __construct(private readonly DocumentRenderer $documents)
    {
    }

    public function render(ReportCard $reportCard, School $school): string
    {
        $p        = $reportCard->payload;
        $columns  = $p['template']['columns'] ?? BulletinTemplate::defaultColumns();
        $options  = $p['template']['options'] ?? BulletinTemplate::defaultOptions();
        $periodLb = ($p['period']['system'] ?? 'trimestre') === 'semestre' ? 'Sem.' : 'Trim.';

        $variables = $this->documents->resolveVariables($school, $reportCard->student);
        $header    = $this->documents->headerHtml($school, $variables);
        $watermark = $this->documents->watermarkHtml($school, $variables);

        $head = '';
        foreach ($columns as $col) {
            $label = e(str_replace('{periode}', $periodLb, $col['label'] ?? ''));
            $align = $this->isLeft($col) ? 'left' : 'center';
            $width = isset($col['width']) ? 'width:' . (float) $col['width'] . '%;' : '';
            $head .= "<th class=\"{$align}\" style=\"{$width}\">{$label}</th>";
        }

        $rows = '';
        foreach ($p['lines'] ?? [] as $line) {
            $cells = '';
            foreach ($columns as $col) {
                $align  = $this->isLeft($col) ? 'left' : 'center';
                $strong = ($col['type'] ?? '') === 'note' && ($col['source'] ?? '') === 'moyenne' ? ' strong' : '';
                $small  = in_array($col['type'] ?? '', ['appreciation', 'teacher'], true) ? ' small' : '';
                $cells .= "<td class=\"{$align}{$strong}{$small}\">" . $this->cell($line, $col) . '</td>';
            }
            $rows .= "<tr>{$cells}</tr>";
        }

        $total = $this->totalRow($columns, $p);
        $info  = $this->infoBlock($p);
        $foot  = $this->footBlock($p, $options);
        $css   = $this->css();
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
                <thead><tr>{$head}</tr></thead>
                <tbody>
                    {$rows}
                    {$total}
                </tbody>
            </table>
            {$foot}
        </body>
        </html>
        HTML;
    }

    private function isLeft(array $col): bool
    {
        return in_array($col['type'] ?? '', ['subject', 'appreciation', 'teacher', 'text'], true);
    }

    /** Valeur d'une cellule selon le type/source de la colonne. */
    private function cell(array $line, array $col): string
    {
        $type   = $col['type'] ?? 'text';
        $source = $col['source'] ?? null;

        return match ($type) {
            'subject'      => e($line['subject'] ?? ''),
            'coefficient'  => $this->num($line['coefficient'] ?? null),
            'definitive'   => $this->num($line['definitive'] ?? null),
            'rang'         => $line['rang'] !== null ? e($this->ordinal((int) $line['rang'])) : '',
            'appreciation' => e($line['appreciation'] ?? ''),
            'teacher'      => e($line['teacher'] ?? ''),
            'signature'    => '',
            'text'         => '',
            'note'         => $this->noteValue($line, $source),
            default        => '',
        };
    }

    private function noteValue(array $line, ?string $source): string
    {
        if ($source === null) {
            return '';
        }
        if (str_starts_with($source, 'type:')) {
            return $this->num($line['by_type'][substr($source, 5)] ?? null);
        }

        return $this->num($line[$source] ?? null); // classe | composition | moyenne
    }

    private function totalRow(array $columns, array $p): string
    {
        $cells = '';
        $first = true;
        foreach ($columns as $col) {
            $type = $col['type'] ?? '';
            if ($first) {
                $cells .= '<td class="left strong">TOTAL</td>';
                $first = false;
                continue;
            }
            $value = match ($type) {
                'coefficient' => $this->num($p['total_coeff'] ?? null),
                'definitive'  => $this->num($p['total_points'] ?? null),
                default       => '',
            };
            $cells .= '<td class="center strong">' . $value . '</td>';
        }

        return "<tr class=\"bul-total-row\">{$cells}</tr>";
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

    private function footBlock(array $p, array $options): string
    {
        $average  = $this->num($p['average'] ?? null);
        $rank     = isset($p['rank']) && $p['rank'] !== null ? e($this->ordinal((int) $p['rank'])) : '—';
        $effectif = e((string) ($p['effectif'] ?? ''));
        $mention  = e($p['mention'] ?? '—');
        $obs      = e($p['observations'] ?? '');
        $nb       = e($options['nb_text'] ?? '');
        $titulaire = e($options['signataire_titulaire'] ?? 'Le Titulaire');
        $chef      = e($options['signataire_chef'] ?? "Le Chef d'Établissement");

        $stats = '';
        if (! empty($options['show_class_stats']) && ! empty($p['class_stats'])) {
            $cs = $p['class_stats'];
            $stats = '<div class="bul-stats">Moyenne la plus forte : <strong>' . $this->num($cs['highest'] ?? null) . '/20</strong>'
                . ' — la plus faible : <strong>' . $this->num($cs['lowest'] ?? null) . '/20</strong>'
                . ' — moyenne de la classe : <strong>' . $this->num($cs['average'] ?? null) . '/20</strong></div>';
        }

        $nbHtml = $nb !== '' ? '<div class="bul-nb">N.B. : ' . $nb . '</div>' : '';

        return <<<HTML
        <table class="bul-summary">
            <tr>
                <td><strong>Moyenne générale :</strong> <span class="big">{$average}/20</span></td>
                <td><strong>Rang :</strong> {$rank} sur {$effectif}</td>
                <td><strong>Mention :</strong> {$mention}</td>
            </tr>
        </table>
        {$stats}

        <div class="bul-obs"><strong>Observations du Chef d'Établissement :</strong> {$obs}</div>

        <table class="bul-sign">
            <tr>
                <td>{$titulaire}<div class="sign-space"></div></td>
                <td>{$chef}<div class="sign-space"></div></td>
            </tr>
        </table>

        {$nbHtml}
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
        .bul-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .bul-table th, .bul-table td { border: 1px solid #333; padding: 3px 4px; text-align: center; word-wrap: break-word; }
        .bul-table th { background: #eee; font-size: 10px; }
        .bul-table td.left, .bul-table th.left { text-align: left; }
        .bul-table td.center { text-align: center; }
        .bul-table td.small { font-size: 9px; font-style: italic; color: #444; }
        .bul-table td.strong, .strong { font-weight: bold; }
        .bul-total-row td { background: #f4f4f4; }
        .bul-summary { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .bul-summary td { padding: 4px; font-size: 12px; }
        .bul-summary .big { font-size: 16px; font-weight: bold; }
        .bul-stats { margin-top: 6px; font-size: 11px; }
        .bul-obs { margin-top: 12px; min-height: 28px; }
        .bul-sign { width: 100%; margin-top: 24px; }
        .bul-sign td { width: 50%; text-align: center; vertical-align: top; }
        .sign-space { height: 60px; }
        .bul-nb { margin-top: 16px; font-style: italic; font-size: 10px; }
        CSS;
    }
}
