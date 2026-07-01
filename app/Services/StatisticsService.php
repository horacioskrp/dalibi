<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Agrégations statistiques (socle V1) : effectifs & parité, finances & recouvrement,
 * réussite & examens officiels. Centralise la donnée pour la page ET les exports.
 *
 * Indicateurs 🇹🇬 : IPS (parité), taux de redoublement / abandon / promotion,
 * taux de recouvrement (dont Mobile Money), taux d'admission aux examens officiels.
 */
class StatisticsService
{
    /** Filtres normalisés. */
    private function filters(array $f): array
    {
        return [
            'year'   => $f['academic_year_id'] ?? null,
            'class'  => $f['class_id'] ?? null,
            'gender' => in_array($f['gender'] ?? null, ['male', 'female', 'other'], true) ? $f['gender'] : null,
        ];
    }

    /* ================= Effectifs & parité ================= */

    public function enrollmentStats(array $filters): array
    {
        $f = $this->filters($filters);

        $base = DB::table('enrollments')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->when($f['year'], fn ($q) => $q->where('enrollments.academic_year_id', $f['year']))
            ->when($f['class'], fn ($q) => $q->where('enrollments.class_id', $f['class']))
            ->when($f['gender'], fn ($q) => $q->where('students.gender', $f['gender']));

        // Répartition par sexe
        $byGender = (clone $base)
            ->selectRaw('students.gender AS gender, COUNT(DISTINCT students.id) AS total')
            ->groupBy('students.gender')
            ->pluck('total', 'gender');

        $male   = (int) ($byGender['male'] ?? 0);
        $female = (int) ($byGender['female'] ?? 0);
        $other  = (int) ($byGender['other'] ?? 0);
        $total  = $male + $female + $other;

        // Effectifs par classe
        $byClass = (clone $base)
            ->join('classes', 'enrollments.class_id', '=', 'classes.id')
            ->selectRaw('classes.name AS name,
                COUNT(DISTINCT CASE WHEN students.gender = ? THEN students.id END) AS male,
                COUNT(DISTINCT CASE WHEN students.gender = ? THEN students.id END) AS female,
                COUNT(DISTINCT students.id) AS total', ['male', 'female'])
            ->groupBy('classes.name')
            ->orderByDesc('total')
            ->get();

        // Répartition par statut académique (promotion / redoublement / abandon)
        $status = (clone $base)
            ->selectRaw('enrollments.academic_status AS s, COUNT(*) AS total')
            ->groupBy('enrollments.academic_status')
            ->pluck('total', 's');

        $valide    = (int) ($status['valide'] ?? 0);
        $nonValide = (int) ($status['non_valide'] ?? 0);
        $abandon   = (int) ($status['abandon'] ?? 0);
        $transfere = (int) ($status['transfere'] ?? 0);
        $enCours   = (int) ($status['en_cours'] ?? 0);
        $decided   = $valide + $nonValide + $abandon; // décisions de fin d'année
        $enrolTotal = $valide + $nonValide + $abandon + $transfere + $enCours;

        // Distribution des âges (calcul PHP, portable pgsql/sqlite)
        $ages = (clone $base)
            ->whereNotNull('students.birth_date')
            ->pluck('students.birth_date')
            ->map(fn ($d) => Carbon::parse($d)->age)
            ->filter(fn ($a) => $a >= 2 && $a <= 30);
        $ageBuckets = [];
        foreach ($ages as $age) {
            $ageBuckets[$age] = ($ageBuckets[$age] ?? 0) + 1;
        }
        ksort($ageBuckets);
        $ageDistribution = collect($ageBuckets)->map(fn ($n, $a) => ['age' => (int) $a, 'total' => $n])->values();

        // Origine géographique (top villes)
        $byCity = (clone $base)
            ->whereNotNull('students.city')
            ->where('students.city', '!=', '')
            ->selectRaw('students.city AS city, COUNT(DISTINCT students.id) AS total')
            ->groupBy('students.city')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $rate = fn (int $n, int $d) => $d > 0 ? round($n / $d * 100, 1) : 0.0;

        return [
            'total'   => $total,
            'gender'  => ['male' => $male, 'female' => $female, 'other' => $other],
            'ips'     => $male > 0 ? round($female / $male, 2) : ($female > 0 ? null : 0),
            'part_filles' => $rate($female, $total),
            'by_class' => $byClass,
            'academic_status' => [
                'valide' => $valide, 'non_valide' => $nonValide, 'abandon' => $abandon,
                'transfere' => $transfere, 'en_cours' => $enCours,
            ],
            'rates' => [
                'promotion'    => $rate($valide, $decided),
                'redoublement' => $rate($nonValide, $decided),
                'abandon'      => $rate($abandon, max($enrolTotal, 1)),
            ],
            'age_distribution' => $ageDistribution,
            'age_moyen'        => $ages->count() ? round($ages->avg(), 1) : null,
            'by_city'          => $byCity,
        ];
    }

    /* ================= Finances & recouvrement ================= */

    public function financeStats(array $filters): array
    {
        $f = $this->filters($filters);

        $inv = DB::table('invoices')
            ->join('enrollments', 'invoices.enrollment_id', '=', 'enrollments.id')
            ->when($f['year'], fn ($q) => $q->where('enrollments.academic_year_id', $f['year']))
            ->when($f['class'], fn ($q) => $q->where('enrollments.class_id', $f['class']));

        $stats = (clone $inv)->selectRaw("
            COUNT(invoices.id) AS total_invoices,
            COALESCE(SUM(invoices.total), 0) AS billed,
            COALESCE(SUM(invoices.amount_paid), 0) AS collected,
            COALESCE(SUM(invoices.amount_remaining), 0) AS remaining,
            COUNT(CASE WHEN invoices.status = 'PAID' THEN 1 END) AS paid_count,
            COUNT(CASE WHEN invoices.status = 'PARTIALLY_PAID' THEN 1 END) AS partial_count,
            COUNT(CASE WHEN invoices.status = 'ISSUED' THEN 1 END) AS unpaid_count
        ")->first();

        $billed    = (float) ($stats->billed ?? 0);
        $collected = (float) ($stats->collected ?? 0);

        // Recouvrement par classe
        $byClass = (clone $inv)
            ->join('classes', 'enrollments.class_id', '=', 'classes.id')
            ->selectRaw('classes.name AS name,
                COALESCE(SUM(invoices.total), 0) AS billed,
                COALESCE(SUM(invoices.amount_paid), 0) AS collected')
            ->groupBy('classes.name')
            ->orderByDesc('billed')
            ->get()
            ->map(fn ($r) => [
                'name'      => $r->name,
                'billed'    => (float) $r->billed,
                'collected' => (float) $r->collected,
                'rate'      => $r->billed > 0 ? round($r->collected / $r->billed * 100, 1) : 0.0,
            ]);

        // Répartition par mode de paiement (dont Mobile Money)
        $byMethod = DB::table('payments')
            ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
            ->join('enrollments', 'invoices.enrollment_id', '=', 'enrollments.id')
            ->when($f['year'], fn ($q) => $q->where('enrollments.academic_year_id', $f['year']))
            ->when($f['class'], fn ($q) => $q->where('enrollments.class_id', $f['class']))
            ->selectRaw('payments.payment_method AS method, COALESCE(SUM(payments.amount), 0) AS total, COUNT(*) AS count')
            ->groupBy('payments.payment_method')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['method' => $r->method, 'total' => (float) $r->total, 'count' => (int) $r->count]);

        // Évolution mensuelle (12 derniers mois) — driver-aware
        $driver = DB::getDriverName();
        $monthExpr = match ($driver) {
            'mysql'  => "DATE_FORMAT(payments.paid_at, '%Y-%m')",
            'sqlite' => "strftime('%Y-%m', payments.paid_at)",
            default  => "to_char(payments.paid_at, 'YYYY-MM')",
        };
        $monthly = DB::table('payments')
            ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
            ->join('enrollments', 'invoices.enrollment_id', '=', 'enrollments.id')
            ->when($f['year'], fn ($q) => $q->where('enrollments.academic_year_id', $f['year']))
            ->where('payments.paid_at', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("{$monthExpr} AS month, COALESCE(SUM(payments.amount), 0) AS total")
            ->groupByRaw($monthExpr)
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'total' => (float) $r->total]);

        return [
            'billed'        => $billed,
            'collected'     => $collected,
            'remaining'     => (float) ($stats->remaining ?? 0),
            'recovery_rate' => $billed > 0 ? round($collected / $billed * 100, 1) : 0.0,
            'total_invoices'=> (int) ($stats->total_invoices ?? 0),
            'paid_count'    => (int) ($stats->paid_count ?? 0),
            'partial_count' => (int) ($stats->partial_count ?? 0),
            'unpaid_count'  => (int) ($stats->unpaid_count ?? 0),
            'by_class'      => $byClass,
            'by_method'     => $byMethod,
            'monthly'       => $monthly,
        ];
    }

    /* ================= Réussite & examens officiels ================= */

    public function successStats(array $filters): array
    {
        $f = $this->filters($filters);

        // Bulletins validés (locked_at non nul)
        $rc = DB::table('report_cards')
            ->when($f['year'], fn ($q) => $q->where('academic_year_id', $f['year']))
            ->when($f['class'], fn ($q) => $q->where('class_id', $f['class']))
            ->whereNotNull('locked_at');

        $rcStats = (clone $rc)->selectRaw('
            COUNT(*) AS total,
            AVG(average) AS avg_moy,
            COUNT(CASE WHEN average >= 10 THEN 1 END) AS pass_count
        ')->first();

        $mentions = (clone $rc)
            ->whereNotNull('mention')->where('mention', '!=', '')
            ->selectRaw('mention, COUNT(*) AS total')
            ->groupBy('mention')
            ->pluck('total', 'mention');

        $rcTotal = (int) ($rcStats->total ?? 0);

        // Examens officiels : inscriptions par examen + taux d'admission
        $exams = DB::table('official_exam_registrations AS r')
            ->join('official_exams AS e', 'r.official_exam_id', '=', 'e.id')
            ->when($f['year'], fn ($q) => $q->where('e.academic_year_id', $f['year']))
            ->selectRaw("
                e.name AS name, e.type AS type, e.center AS center,
                COUNT(*) AS registered,
                COUNT(CASE WHEN r.status = 'admis' THEN 1 END) AS admitted,
                COUNT(CASE WHEN r.status = 'echoue' THEN 1 END) AS failed,
                COUNT(CASE WHEN r.status = 'absent' THEN 1 END) AS absent
            ")
            ->groupBy('e.id', 'e.name', 'e.type', 'e.center')
            ->orderBy('e.type')
            ->get()
            ->map(function ($r) {
                $presented = (int) $r->admitted + (int) $r->failed;
                return [
                    'name'       => $r->name,
                    'type'       => $r->type,
                    'center'     => $r->center,
                    'registered' => (int) $r->registered,
                    'admitted'   => (int) $r->admitted,
                    'failed'     => (int) $r->failed,
                    'absent'     => (int) $r->absent,
                    'admission_rate'    => $presented > 0 ? round($r->admitted / $presented * 100, 1) : 0.0,
                    'presentation_rate' => $r->registered > 0 ? round($presented / $r->registered * 100, 1) : 0.0,
                ];
            });

        // Agrégat global examens officiels
        $totReg = $exams->sum('registered');
        $totAdm = $exams->sum('admitted');
        $totPres = $exams->sum(fn ($e) => $e['admitted'] + $e['failed']);

        return [
            'bulletins'      => $rcTotal,
            'moyenne_generale' => $rcStats->avg_moy !== null ? round((float) $rcStats->avg_moy, 2) : null,
            'pass_rate'      => $rcTotal > 0 ? round(((int) $rcStats->pass_count) / $rcTotal * 100, 1) : 0.0,
            'mentions'       => [
                'passable'   => (int) ($mentions['passable'] ?? 0),
                'assez_bien' => (int) ($mentions['assez_bien'] ?? 0),
                'bien'       => (int) ($mentions['bien'] ?? 0),
                'tres_bien'  => (int) ($mentions['tres_bien'] ?? 0),
            ],
            'exams'          => $exams,
            'exams_summary'  => [
                'registered'     => (int) $totReg,
                'admitted'       => (int) $totAdm,
                'admission_rate' => $totPres > 0 ? round($totAdm / $totPres * 100, 1) : 0.0,
            ],
        ];
    }

    /* ================= Aiguillage ================= */

    /** Renvoie les données d'une section. */
    public function section(string $section, array $filters): array
    {
        return match ($section) {
            'finances' => $this->financeStats($filters),
            'reussite' => $this->successStats($filters),
            default    => $this->enrollmentStats($filters),
        };
    }
}
