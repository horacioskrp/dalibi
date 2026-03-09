<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassSubjectRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'assignments' => ['required', 'array', 'min:1'],
            'assignments.*.subject_id' => ['required', 'uuid', 'exists:subjects,id', 'distinct'],
            'assignments.*.coefficient' => ['required', 'numeric', 'gt:0', 'max:999.99'],
            'academic_year_id' => [
                'required',
                'uuid',
                Rule::exists('academic_years', 'id')->where('active', true),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'class_id.required' => 'La classe est requise.',
            'class_id.uuid' => 'La classe est invalide.',
            'class_id.exists' => 'La classe sélectionnée n\'existe pas.',
            'assignments.required' => 'Au moins une matière est requise.',
            'assignments.array' => 'Les matières doivent être un tableau.',
            'assignments.min' => 'Veuillez sélectionner au moins une matière.',
            'assignments.*.subject_id.required' => 'La matière est requise.',
            'assignments.*.subject_id.uuid' => 'L\'une des matières sélectionnées est invalide.',
            'assignments.*.subject_id.exists' => 'L\'une des matières sélectionnées n\'existe pas.',
            'assignments.*.subject_id.distinct' => 'Chaque matière doit être sélectionnée une seule fois.',
            'assignments.*.coefficient.required' => 'Le coefficient est requis pour chaque matière sélectionnée.',
            'assignments.*.coefficient.numeric' => 'Le coefficient doit être un nombre valide.',
            'assignments.*.coefficient.gt' => 'Le coefficient doit être supérieur à 0.',
            'assignments.*.coefficient.max' => 'Le coefficient ne peut pas dépasser 999,99.',
            'academic_year_id.required' => 'L\'année académique est requise.',
            'academic_year_id.uuid' => 'L\'année académique est invalide.',
            'academic_year_id.exists' => 'L\'année académique sélectionnée est invalide ou inactive.',
        ];
    }
}
