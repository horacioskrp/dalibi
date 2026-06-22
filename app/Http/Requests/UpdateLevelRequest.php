<?php

namespace App\Http\Requests;

use App\Constants\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLevelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('edit_levels');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::in(['maternelle', 'primaire', 'lycee', 'college']),
                Rule::unique('levels', 'name')->ignore($this->level),
            ],
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
