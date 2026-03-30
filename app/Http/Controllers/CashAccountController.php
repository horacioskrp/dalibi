<?php

namespace App\Http\Controllers;

use App\Models\CashAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CashAccountController extends Controller
{
    public function index(): Response
    {
        $accounts = CashAccount::withCount('payments')
            ->withSum('transactions as total_income', 'amount', fn ($q) => $q->where('type', 'INCOME'))
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('Accounting/CashAccounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'type'        => ['required', Rule::in(['CASH', 'MOBILE_MONEY', 'BANK'])],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        CashAccount::create($data);

        return back()->with('success', 'Caisse créée avec succès.');
    }

    public function update(Request $request, CashAccount $cashAccount): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'type'        => ['required', Rule::in(['CASH', 'MOBILE_MONEY', 'BANK'])],
            'description' => ['nullable', 'string', 'max:255'],
            'active'      => ['boolean'],
        ]);

        $cashAccount->update($data);

        return back()->with('success', 'Caisse mise à jour.');
    }

    public function destroy(CashAccount $cashAccount): RedirectResponse
    {
        // Refuser si des paiements sont liés
        if ($cashAccount->payments()->exists()) {
            return back()->withErrors(['delete' => 'Impossible de supprimer une caisse liée à des paiements.']);
        }

        $cashAccount->delete();

        return back()->with('success', 'Caisse supprimée.');
    }
}
