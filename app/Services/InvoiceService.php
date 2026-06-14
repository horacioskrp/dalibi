<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\StudentScholarship;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(private readonly AccountingService $accountingService) {}

    /**
     * Génère automatiquement une facture à partir d'une inscription.
     * Récupère les FeeStructures de la classe/année et les bourses éventuelles.
     */
    public function createFromEnrollment(Enrollment $enrollment): Invoice
    {
        return DB::transaction(function () use ($enrollment): Invoice {
            $feeStructures = FeeStructure::with('feeCategory')
                ->where('class_id', $enrollment->class_id)
                ->where('academic_year_id', $enrollment->academic_year_id)
                ->orderBy('created_at')
                ->get();

            $invoice = Invoice::create([
                'enrollment_id'    => $enrollment->id,
                'invoice_number'   => $this->generateInvoiceNumber(),
                'subtotal'         => 0,
                'discount_amount'  => 0,
                'total'            => 0,
                'amount_paid'      => 0,
                'amount_remaining' => 0,
                'status'           => 'ISSUED',
                'issued_at'        => now()->toDateString(),
            ]);

            $order = 0;
            foreach ($feeStructures as $fee) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'label'      => $fee->feeCategory->name ?? 'Frais scolaires',
                    'type'       => 'FEE',
                    'amount'     => $fee->amount,
                    'sort_order' => $order++,
                ]);
            }

            // Bourse éventuelle → ligne DISCOUNT + transaction comptable
            $studentScholarship = StudentScholarship::with(['scholarship', 'student'])
                ->where('student_id', $enrollment->student_id)
                ->where('academic_year_id', $enrollment->academic_year_id)
                ->first();

            if ($studentScholarship && $studentScholarship->scholarship) {
                $scholarship = $studentScholarship->scholarship;
                $subtotal    = $feeStructures->sum('amount');

                $discountAmount = $scholarship->type === 'percentage'
                    ? round($subtotal * ((float) $scholarship->value / 100), 2)
                    : (float) $scholarship->value;

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'label'      => 'Bourse : ' . $scholarship->name,
                    'type'       => 'DISCOUNT',
                    'amount'     => $discountAmount,
                    'sort_order' => $order,
                ]);

                $this->accountingService->recordScholarshipTransaction($studentScholarship, $discountAmount);
            }

            $invoice->recalculate();

            return $invoice->fresh();
        });
    }

    /**
     * Enregistre un paiement, crée le reçu, recalcule la facture,
     * et met à jour le statut de l'inscription si soldée.
     */
    public function recordPayment(Invoice $invoice, array $data): Payment
    {
        return DB::transaction(function () use ($invoice, $data): Payment {
            $data['invoice_id'] = $invoice->id;

            $payment = Payment::create($data);

            Receipt::create([
                'payment_id'     => $payment->id,
                'receipt_number' => $this->generateReceiptNumber(),
            ]);

            $invoice->recalculate();

            $this->accountingService->recordPaymentTransaction($payment);

            $enrollment = $invoice->enrollment;
            if (in_array($invoice->fresh()->status, ['PARTIALLY_PAID', 'PAID'], true)) {
                $enrollment->update(['status' => 'ACTIVE']);
            }

            return $payment->load('receipt');
        });
    }

    /* ------------------------------------------------------------------ */
    /* Générateurs de numéros uniques                                      */
    /* ------------------------------------------------------------------ */

    public function generateInvoiceNumber(): string
    {
        do {
            $number = 'INV-' . now()->format('Y') . '-' . str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (Invoice::where('invoice_number', $number)->exists());

        return $number;
    }

    public function generateReceiptNumber(): string
    {
        do {
            $number = 'REC-' . now()->format('Y') . '-' . str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (Receipt::where('receipt_number', $number)->exists());

        return $number;
    }
}
