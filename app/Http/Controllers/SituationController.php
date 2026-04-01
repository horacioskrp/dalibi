<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SituationController extends Controller
{
    public function index(Request $request)
    {
        $yearId  = $request->academic_year_id;
        $classId = $request->class_id;

        $academicYears = AcademicYear::orderBy('year', 'desc')->get(['id', 'year', 'active']);
        $classrooms    = Classroom::orderBy('name')->get(['id', 'name', 'code']);

        $enrollments = Enrollment::with(['student', 'classroom', 'invoice'])
            ->when($yearId,  fn ($q) => $q->where('academic_year_id', $yearId))
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->get();

        /* ── Résumé par classe ── */
        $byClass = $enrollments
            ->groupBy('class_id')
            ->map(function ($rows) {
                $classroom = $rows->first()->classroom;
                $invoices  = $rows->map->invoice->filter();

                return [
                    'class_id'         => $classroom?->id,
                    'class_name'       => $classroom?->name,
                    'class_code'       => $classroom?->code,
                    'total_students'   => $rows->count(),
                    'total_amount'     => (float) $invoices->sum('total'),
                    'amount_paid'      => (float) $invoices->sum('amount_paid'),
                    'amount_remaining' => (float) $invoices->sum('amount_remaining'),
                    'paid_count'       => $invoices->where('status', 'PAID')->count(),
                    'partial_count'    => $invoices->where('status', 'PARTIALLY_PAID')->count(),
                    'issued_count'     => $invoices->where('status', 'ISSUED')->count(),
                    'cancelled_count'  => $invoices->where('status', 'CANCELLED')->count(),
                ];
            })
            ->sortBy('class_name')
            ->values();

        /* ── Liste élèves (quand une classe est sélectionnée) ── */
        $students = $classId
            ? $enrollments->map(function ($enrollment) {
                $inv = $enrollment->invoice;

                return [
                    'enrollment_id'    => $enrollment->id,
                    'enrollment_code'  => $enrollment->enrollment_code,
                    'student_id'       => $enrollment->student?->id,
                    'firstname'        => $enrollment->student?->firstname,
                    'lastname'         => $enrollment->student?->lastname,
                    'matricule'        => $enrollment->student?->matricule,
                    'invoice_number'   => $inv?->invoice_number,
                    'total'            => (float) ($inv?->total ?? 0),
                    'amount_paid'      => (float) ($inv?->amount_paid ?? 0),
                    'amount_remaining' => (float) ($inv?->amount_remaining ?? 0),
                    'status'           => $inv?->status ?? 'ISSUED',
                ];
            })->sortByDesc('amount_remaining')->values()
            : collect();

        /* ── Stats globales ── */
        $allInvoices = $enrollments->map->invoice->filter();
        $globalStats = [
            'total_students'   => $enrollments->count(),
            'total_amount'     => (float) $allInvoices->sum('total'),
            'amount_paid'      => (float) $allInvoices->sum('amount_paid'),
            'amount_remaining' => (float) $allInvoices->sum('amount_remaining'),
            'paid_count'       => $allInvoices->where('status', 'PAID')->count(),
            'partial_count'    => $allInvoices->where('status', 'PARTIALLY_PAID')->count(),
            'issued_count'     => $allInvoices->where('status', 'ISSUED')->count(),
        ];

        return Inertia::render('Accounting/Situation', [
            'academicYears' => $academicYears,
            'classrooms'    => $classrooms,
            'filters'       => [
                'academic_year_id' => $yearId,
                'class_id'         => $classId,
            ],
            'globalStats' => $globalStats,
            'byClass'     => $byClass,
            'students'    => $students,
        ]);
    }

    /**
     * Export CSV : toute la classe ou uniquement les impayés.
     */
    public function export(Request $request)
    {
        $yearId  = $request->academic_year_id;
        $classId = $request->class_id;
        $type    = $request->get('type', 'all'); // all | unpaid

        $query = Enrollment::with(['student', 'classroom', 'invoice'])
            ->when($yearId,  fn ($q) => $q->where('academic_year_id', $yearId))
            ->when($classId, fn ($q) => $q->where('class_id', $classId));

        if ($type === 'unpaid') {
            $query->whereHas('invoice', fn ($q) => $q->whereIn('status', ['ISSUED', 'PARTIALLY_PAID']));
        }

        $enrollments = $query->orderBy('created_at')->get();

        $suffix   = $type === 'unpaid' ? 'impayes' : 'complet';
        $date     = now()->format('Y-m-d');
        $filename = "situation_{$suffix}_{$date}.csv";

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-cache, no-store',
        ];

        $callback = function () use ($enrollments) {
            $out = fopen('php://output', 'w');
            // BOM UTF-8 pour Excel
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'Matricule', 'Nom', 'Prénom', 'Classe',
                'N° Facture', 'Total (F)', 'Payé (F)', 'Reste (F)', 'Statut',
            ], ';');

            foreach ($enrollments as $e) {
                $inv = $e->invoice;
                fputcsv($out, [
                    $e->student?->matricule ?? '—',
                    $e->student?->lastname  ?? '—',
                    $e->student?->firstname ?? '—',
                    $e->classroom?->name    ?? '—',
                    $inv?->invoice_number   ?? '—',
                    number_format((float) ($inv?->total ?? 0), 0, ',', ' '),
                    number_format((float) ($inv?->amount_paid ?? 0), 0, ',', ' '),
                    number_format((float) ($inv?->amount_remaining ?? 0), 0, ',', ' '),
                    $this->statusLabel($inv?->status),
                ], ';');
            }

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'PAID'           => 'Soldé',
            'PARTIALLY_PAID' => 'Partiel',
            'ISSUED'         => 'Non payé',
            'CANCELLED'      => 'Annulé',
            default          => '—',
        };
    }
}
