<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLevelRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', Rule::in(['maternelle', 'primaire', 'lycee', 'college']), 'unique:levels,name'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du niveau est requis.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'name.in' => 'Le niveau doit être l\'un des suivants : maternelle, primaire, lycee, college.',
            'name.unique' => 'Ce niveau existe déjà.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
        ];
    }
}
