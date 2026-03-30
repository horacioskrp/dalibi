<?php

namespace App\Services;

use App\Models\AccountingTransaction;
use App\Models\CashAccount;
use App\Models\Payment;
use App\Models\StudentScholarship;

class AccountingService
{
    /**
     * Crée une transaction INCOME pour un paiement
     * et incrémente la caisse correspondante.
     * Doit être appelé dans un DB::transaction.
     */
    public function recordPaymentTransaction(Payment $payment): AccountingTransaction
    {
        // Récupérer le nom de l'élève pour la description
        $invoice    = $payment->invoice()->with('enrollment.student')->first();
        $student    = $invoice?->enrollment?->student;
        $studentName = $student
            ? "{$student->firstname} {$student->lastname}"
            : 'Élève inconnu';

        $transaction = AccountingTransaction::create([
            'type'             => 'INCOME',
            'amount'           => $payment->amount,
            'description'      => "Paiement écolage — {$studentName}",
            'reference_type'   => 'PAYMENT',
            'reference_id'     => $payment->id,
            'cash_account_id'  => $payment->cash_account_id,
            'created_by'       => auth()->id(),
            'transaction_date' => $payment->paid_at ?? now(),
        ]);

        // Mettre à jour le solde de la caisse
        if ($payment->cash_account_id) {
            CashAccount::where('id', $payment->cash_account_id)
                ->increment('balance', $payment->amount);
        }

        return $transaction;
    }

    /**
     * Crée une transaction EXPENSE pour une bourse accordée.
     * Doit être appelé dans un DB::transaction.
     */
    public function recordScholarshipTransaction(
        StudentScholarship $studentScholarship,
        float $discountAmount
    ): AccountingTransaction {
        $student     = $studentScholarship->student;
        $scholarship = $studentScholarship->scholarship;
        $studentName = $student
            ? "{$student->firstname} {$student->lastname}"
            : 'Élève inconnu';
        $scholarshipName = $scholarship?->name ?? 'Bourse';

        return AccountingTransaction::create([
            'type'             => 'EXPENSE',
            'amount'           => $discountAmount,
            'description'      => "Réduction '{$scholarshipName}' accordée à {$studentName}",
            'reference_type'   => 'SCHOLARSHIP',
            'reference_id'     => $studentScholarship->id,
            'created_by'       => auth()->id(),
            'transaction_date' => now(),
        ]);
    }

    /**
     * Annulation d'un paiement : transaction inverse + décrémentation de la caisse.
     */
    public function cancelPaymentTransaction(Payment $payment): AccountingTransaction
    {
        $invoice     = $payment->invoice()->with('enrollment.student')->first();
        $student     = $invoice?->enrollment?->student;
        $studentName = $student
            ? "{$student->firstname} {$student->lastname}"
            : 'Élève inconnu';

        $transaction = AccountingTransaction::create([
            'type'             => 'EXPENSE',
            'amount'           => $payment->amount,
            'description'      => "Annulation paiement — {$studentName}",
            'reference_type'   => 'CANCELLATION',
            'reference_id'     => $payment->id,
            'cash_account_id'  => $payment->cash_account_id,
            'created_by'       => auth()->id(),
            'transaction_date' => now(),
        ]);

        // Décrémenter la caisse
        if ($payment->cash_account_id) {
            CashAccount::where('id', $payment->cash_account_id)
                ->decrement('balance', $payment->amount);
        }

        return $transaction;
    }
}
