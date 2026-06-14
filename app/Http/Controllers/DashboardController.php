<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Models\AcademicYear;
use App\Models\CashAccount;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\SubjectAssignment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user       = auth()->user();
        $activeYear = AcademicYear::where('active', true)->first();
        $yearId     = $activeYear?->id;

        $data = [
            'activeYear' => $activeYear ? ['id' => $activeYear->id, 'year' => $activeYear->year] : null,
            'userRole'   => $user->roles->first()?->name,
        ];

        /* ── Section financière : ADMIN, DIRECTEUR, COMPTABILITÉ ─────────── */
        if ($user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::ACCOUNTING])) {
            /* Statistiques globales factures */
            $stats = DB::table('invoices')
                ->join('enrollments', 'invoices.enrollment_id', '=', 'enrollments.id')
                ->when($yearId, fn ($q) => $q->where('enrollments.academic_year_id', $yearId))
                ->selectRaw("
                    COUNT(invoices.id)                                              AS total_invoices,
                    COALESCE(SUM(invoices.total), 0)                               AS total_amount,
                    COALESCE(SUM(invoices.amount_paid), 0)                         AS total_paid,
                    COALESCE(SUM(invoices.amount_remaining), 0)                    AS total_remaining,
                    COUNT(CASE WHEN invoices.status = 'PAID'           THEN 1 END) AS paid_count,
                    COUNT(CASE WHEN invoices.status = 'PARTIALLY_PAID' THEN 1 END) AS partial_count,
                    COUNT(CASE WHEN invoices.status = 'ISSUED'         THEN 1 END) AS issued_count
                ")
                ->first();

            /* Évolution mensuelle des paiements — 6 derniers mois */
            $driver = DB::getDriverName();
            $monthExpr = match ($driver) {
                'mysql'  => "DATE_FORMAT(payments.paid_at, '%Y-%m')",
                'sqlite' => "strftime('%Y-%m', payments.paid_at)",
                default  => "to_char(payments.paid_at, 'YYYY-MM')",
            };
            $monthLabelExpr = match ($driver) {
                'mysql'  => "DATE_FORMAT(payments.paid_at, '%b %Y')",
                'sqlite' => "strftime('%m/%Y', payments.paid_at)",
                default  => "to_char(payments.paid_at, 'Mon YYYY')",
            };

            $monthlyPayments = DB::table('payments')
                ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                ->join('enrollments', 'invoices.enrollment_id', '=', 'enrollments.id')
                ->when($yearId, fn ($q) => $q->where('enrollments.academic_year_id', $yearId))
                ->where('payments.paid_at', '>=', now()->subMonths(5)->startOfMonth())
                ->selectRaw("
                    {$monthExpr} AS month,
                    {$monthLabelExpr} AS month_label,
                    COALESCE(SUM(payments.amount), 0) AS total
                ")
                ->groupByRaw("{$monthExpr}, {$monthLabelExpr}")
                ->orderBy('month')
                ->get();

            /* Soldes des caisses */
            $cashAccounts = CashAccount::where('active', true)
                ->orderBy('type')
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'balance']);

            /* 5 derniers paiements */
            $recentPayments = Payment::with([
                    'invoice.enrollment.student:id,firstname,lastname',
                    'invoice.enrollment.classroom:id,name',
                    'cashAccount:id,name,type',
                ])
                ->latest('paid_at')
                ->limit(5)
                ->get()
                ->map(fn ($p) => [
                    'id'            => $p->id,
                    'amount'        => (float) $p->amount,
                    'payment_method'=> $p->payment_method,
                    'paid_at'       => $p->paid_at?->toDateString(),
                    'cash_account'  => $p->cashAccount?->name,
                    'student_name'  => $p->invoice?->enrollment?->student
                        ? $p->invoice->enrollment->student->firstname . ' ' . $p->invoice->enrollment->student->lastname
                        : '—',
                    'class_name'    => $p->invoice?->enrollment?->classroom?->name ?? '—',
                ]);

            /* Élèves avec aucun paiement (status ISSUED) — top 5 restant le + élevé */
            $studentsNoPay = Enrollment::with([
                    'student:id,firstname,lastname,matricule',
                    'classroom:id,name,code',
                    'invoice:id,enrollment_id,total,amount_remaining,status',
                ])
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->whereHas('invoice', fn ($q) => $q->where('status', 'ISSUED'))
                ->orderByDesc(
                    Invoice::select('amount_remaining')
                        ->whereColumn('enrollment_id', 'enrollments.id')
                        ->limit(1)
                )
                ->limit(5)
                ->get();

            $data['financial'] = [
                'stats'          => $stats,
                'monthlyPayments'=> $monthlyPayments,
                'cashAccounts'   => $cashAccounts,
                'recentPayments' => $recentPayments,
                'studentsNoPay'  => $studentsNoPay,
            ];
        }

        /* ── Section inscriptions : ADMIN, DIRECTEUR, SECRÉTARIAT ───────── */
        if ($user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::SECRETARIAT])) {
            $recentEnrollments = Enrollment::with([
                    'student:id,firstname,lastname,matricule',
                    'classroom:id,name,code',
                ])
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->latest('enrollment_date')
                ->limit(6)
                ->get()
                ->map(fn ($e) => [
                    'id'              => $e->id,
                    'enrollment_code' => $e->enrollment_code,
                    'enrollment_date' => $e->enrollment_date?->toDateString(),
                    'status'          => $e->status,
                    'student_name'    => $e->student
                        ? $e->student->firstname . ' ' . $e->student->lastname
                        : '—',
                    'matricule'  => $e->student?->matricule,
                    'class_name' => $e->classroom?->name ?? '—',
                    'class_code' => $e->classroom?->code ?? '—',
                ]);

            $data['enrollments'] = [
                'total_students'    => Student::count(),
                'active_students'   => Student::where('active', true)->count(),
                'enrollments_year'  => Enrollment::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count(),
                'enrollments_week'  => Enrollment::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                    ->where('enrollment_date', '>=', now()->startOfWeek())
                    ->count(),
                'recentEnrollments' => $recentEnrollments,
            ];
        }

        /* ── Section enseignant : ENSEIGNANT ──────────────────────────────── */
        if ($user->hasRole(Roles::TEACHER)) {
            $myAssignments = SubjectAssignment::with(['subject:id,name', 'classroom:id,name,code'])
                ->where('teacher_id', $user->id)
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->where('active', true)
                ->get()
                ->map(fn ($a) => [
                    'id'         => $a->id,
                    'subject'    => $a->subject?->name ?? '—',
                    'class_name' => $a->classroom?->name ?? '—',
                    'class_code' => $a->classroom?->code ?? '—',
                ]);

            $data['teaching'] = [
                'assignments' => $myAssignments,
            ];
        }

        return Inertia::render('dashboard', $data);
    }
}
