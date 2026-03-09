<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:subjects,code'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la matière est requis.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'code.required' => 'Le code de la matière est requis.',
            'code.max' => 'Le code ne peut pas dépasser 50 caractères.',
            'code.unique' => 'Ce code est déjà utilisé par une autre matière.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
        ];
    }
}
