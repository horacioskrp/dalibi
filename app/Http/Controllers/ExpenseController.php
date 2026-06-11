<?php

/**
 * Projet : Système de Gestion Scolaire (SIGE) - Togo
 * Description : Gestion des élèves, des notes et des bulletins.
 * * Copyright (c) 2026 Kudayah Sassou Horacio Herve.
 */

namespace App\Http\Controllers;

use App\Models\AccountingTransaction;
use App\Models\CashAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    /**
     * Store a manual expense transaction.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'description'      => ['required', 'string', 'max:255'],
            'amount'           => ['required', 'numeric', 'min:1', 'max:999999999'],
            'cash_account_id'  => ['required', 'uuid', 'exists:cash_accounts,id'],
            'transaction_date' => ['required', 'date'],
        ], [
            'description.required'      => 'La description est obligatoire.',
            'amount.required'           => 'Le montant est obligatoire.',
            'amount.min'                => 'Le montant doit être supérieur à 0.',
            'cash_account_id.required'  => 'Veuillez sélectionner une caisse.',
            'transaction_date.required' => 'La date est obligatoire.',
        ]);

        DB::transaction(function () use ($validated): void {
            AccountingTransaction::create([
                'type'             => 'EXPENSE',
                'amount'           => $validated['amount'],
                'description'      => $validated['description'],
                'reference_type'   => 'EXPENSE',
                'cash_account_id'  => $validated['cash_account_id'],
                'created_by'       => auth()->id(),
                'transaction_date' => $validated['transaction_date'],
            ]);

            CashAccount::where('id', $validated['cash_account_id'])
                ->decrement('balance', $validated['amount']);
        });

        return back()->with('success', 'Dépense enregistrée avec succès.');
    }

    /**
     * Delete a manual expense transaction and reverse the balance.
     */
    public function destroy(AccountingTransaction $transaction): RedirectResponse
    {
        if ($transaction->reference_type !== 'EXPENSE') {
            return back()->withErrors(['delete' => 'Seules les dépenses manuelles peuvent être supprimées.']);
        }

        DB::transaction(function () use ($transaction): void {
            if ($transaction->cash_account_id) {
                CashAccount::where('id', $transaction->cash_account_id)
                    ->increment('balance', $transaction->amount);
            }

            $transaction->delete();
        });

        return back()->with('success', 'Dépense supprimée et solde de caisse restauré.');
    }
}
