<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\CashAccount;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoiceService) {}

    /**
     * Page principale : facture + historique des paiements + formulaire ajout paiement.
     */
    public function show(Enrollment $enrollment): Response
    {
        $enrollment->load(['school', 'student', 'classroom', 'academicYear', 'enrolledBy']);

        $invoice = $enrollment->invoice()->with([
            'items',
            'payments.receipt',
            'payments.createdBy',
        ])->first();

        // Créer la facture automatiquement si elle n'existe pas encore
        if (! $invoice) {
            $invoice = $this->invoiceService->createFromEnrollment($enrollment);
            $invoice->load(['items', 'payments.receipt', 'payments.createdBy']);
        }

        return Inertia::render('Enrollments/Invoice', [
            'enrollment'   => $enrollment,
            'invoice'      => $invoice,
            'cashAccounts' => CashAccount::where('active', true)->orderBy('type')->orderBy('name')->get(['id', 'name', 'type']),
        ]);
    }

    /**
     * Enregistre un paiement pour l'inscription.
     */
    public function storePayment(StorePaymentRequest $request, Enrollment $enrollment): RedirectResponse
    {
        $invoice = $enrollment->invoice;

        if (! $invoice) {
            return back()->withErrors(['invoice' => 'Aucune facture trouvée pour cette inscription.']);
        }

        $data = $request->validated();
        $data['created_by'] = auth()->id();

        DB::transaction(function () use ($data, $invoice): void {
            $this->invoiceService->recordPayment($invoice, $data);
        });

        return redirect()->route('enrollments.invoice', $enrollment->id)
            ->with('success', 'Paiement enregistré avec succès.');
    }

    /**
     * Page d'impression du reçu d'un paiement.
     */
    public function receipt(Payment $payment): Response
    {
        $payment->load([
            'receipt',
            'invoice.enrollment.school',
            'invoice.enrollment.student',
            'invoice.enrollment.classroom',
            'invoice.enrollment.academicYear',
            'invoice.items',
            'createdBy',
        ]);

        return Inertia::render('Payments/Receipt', [
            'payment' => $payment,
        ]);
    }
}
