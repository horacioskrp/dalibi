<?php

namespace App\Http\Controllers;

use App\Models\FeeStructure;
use App\Models\Installment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstallmentController extends Controller
{
    /**
     * Store multiple installments for a fee structure.
     */
    public function storeMultiple(Request $request, FeeStructure $feeStructure)
    {
        $request->validate([
            'installments' => 'required|array|min:1',
            'installments.*.name' => 'required|string|max:255',
            'installments.*.installment_number' => 'required|integer|min:1',
            'installments.*.amount' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $feeStructure) {
            // Delete existing installments
            $feeStructure->installments()->delete();

            // Create new installments
            foreach ($request->installments as $installmentData) {
                Installment::create([
                    'fee_structure_id' => $feeStructure->id,
                    'name' => $installmentData['name'],
                    'installment_number' => $installmentData['installment_number'],
                    'amount' => $installmentData['amount'],
                ]);
            }
        });

        return redirect()->back()->with('message', 'Tranches mises à jour avec succès.');
    }
}
