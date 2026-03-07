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
            'subject_ids' => ['required', 'array', 'min:1'],
            'subject_ids.*' => ['uuid', 'exists:subjects,id'],
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
            'subject_ids.required' => 'Au moins une matière est requise.',
            'subject_ids.array' => 'Les matières doivent être un tableau.',
            'subject_ids.min' => 'Veuillez sélectionner au moins une matière.',
            'subject_ids.*.uuid' => 'L\'une des matières sélectionnées est invalide.',
            'subject_ids.*.exists' => 'L\'une des matières sélectionnées n\'existe pas.',
            'academic_year_id.required' => 'L\'année académique est requise.',
            'academic_year_id.uuid' => 'L\'année académique est invalide.',
            'academic_year_id.exists' => 'L\'année académique sélectionnée est invalide ou inactive.',
        ];
    }
}
