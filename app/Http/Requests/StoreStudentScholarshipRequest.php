<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentScholarshipRequest extends FormRequest
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
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'scholarship_id' => ['required', 'uuid', 'exists:scholarships,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
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
            'student_id.required' => 'L\'élève est requis.',
            'student_id.uuid' => 'L\'élève doit être un UUID valide.',
            'student_id.exists' => 'L\'élève sélectionné n\'existe pas.',
            'scholarship_id.required' => 'La bourse d\'études est requise.',
            'scholarship_id.uuid' => 'La bourse d\'études doit être un UUID valide.',
            'scholarship_id.exists' => 'La bourse d\'études sélectionnée n\'existe pas.',
            'academic_year_id.required' => 'L\'année académique est requise.',
            'academic_year_id.uuid' => 'L\'année académique doit être un UUID valide.',
            'academic_year_id.exists' => 'L\'année académique sélectionnée n\'existe pas.',
            'notes.string' => 'Les notes doivent être une chaîne de caractères.',
            'notes.max' => 'Les notes ne peuvent pas dépasser 1000 caractères.',
        ];
    }
}