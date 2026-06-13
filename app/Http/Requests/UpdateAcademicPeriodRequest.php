<?php

namespace App\Http\Requests;

use App\Constants\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]);
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
            'description' => ['nullable', 'string', 'max:1000'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'type' => ['required', Rule::in(['trimestre', 'semestre'])],
            'order' => ['nullable', 'integer', 'min:1'],
            'is_current' => ['nullable', 'boolean'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la période est obligatoire.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
            'start_date.required' => 'La date de début est obligatoire.',
            'start_date.date' => 'La date de début doit être une date valide.',
            'end_date.required' => 'La date de fin est obligatoire.',
            'end_date.date' => 'La date de fin doit être une date valide.',
            'end_date.after' => 'La date de fin doit être postérieure à la date de début.',
            'type.required' => 'Le type de période est obligatoire.',
            'type.in' => 'Le type doit être trimestre ou semestre.',
            'order.integer' => "L'ordre doit être un nombre entier.",
            'order.min' => "L'ordre doit être au moins 1.",
            'academic_year_id.required' => "L'année académique est obligatoire.",
            'academic_year_id.uuid' => "L'identifiant de l'année académique n'est pas valide.",
            'academic_year_id.exists' => "L'année académique sélectionnée n'existe pas.",
        ];
    }
}
