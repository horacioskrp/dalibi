<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'           => ['required', 'numeric', 'min:1'],
            'payment_method'   => ['required', Rule::in(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE'])],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'paid_by'          => ['nullable', 'string', 'max:150'],
            'paid_at'          => ['required', 'date'],
            'notes'            => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required'         => 'Le montant est obligatoire.',
            'amount.min'              => 'Le montant doit être supérieur à 0.',
            'payment_method.required' => 'Le mode de paiement est obligatoire.',
            'paid_at.required'        => 'La date de paiement est obligatoire.',
        ];
    }
}
