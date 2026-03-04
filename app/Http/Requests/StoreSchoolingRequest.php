<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'inscription_fee' => ['required', 'numeric', 'min:0'],
            'school_fee' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.uuid' => "L'identifiant de la classe n'est pas valide.",
            'class_id.exists' => 'La classe sélectionnée est invalide.',
            'inscription_fee.required' => "Les frais d'inscription sont obligatoires.",
            'inscription_fee.numeric' => "Les frais d'inscription doivent être un nombre.",
            'inscription_fee.min' => "Les frais d'inscription ne peuvent pas être négatifs.",
            'school_fee.required' => "Les frais de scolarité sont obligatoires.",
            'school_fee.numeric' => 'Les frais de scolarité doivent être un nombre.',
            'school_fee.min' => 'Les frais de scolarité ne peuvent pas être négatifs.',
        ];
    }
}
