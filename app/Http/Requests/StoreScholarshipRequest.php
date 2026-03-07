<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScholarshipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:scholarships,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->input('type') === 'percentage' && (float) $value > 100) {
                        $fail('La valeur en pourcentage ne peut pas dépasser 100.');
                    }
                },
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la bourse est requis.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'name.unique' => 'Ce nom de bourse existe déjà.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
            'type.required' => 'Le type de bourse est requis.',
            'type.in' => 'Le type sélectionné est invalide.',
            'value.required' => 'La valeur de la bourse est requise.',
            'value.numeric' => 'La valeur doit être un nombre valide.',
            'value.min' => 'La valeur doit être supérieure ou égale à 0.',
        ];
    }
}
