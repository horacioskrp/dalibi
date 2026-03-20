<?php


namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentScholarshipRequest extends FormRequest
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
            'number_of_year' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
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
            'number_of_year.integer' => 'Le nombre d\'années doit être un nombre entier.',
            'number_of_year.min' => 'Le nombre d\'années doit être au moins 1.',
            'start_date.date' => 'La date de début n\'est pas valide.',
            'end_date.date' => 'La date de fin n\'est pas valide.',
            'end_date.after_or_equal' => 'La date de fin doit être après ou égale à la date de début.',
            'notes.string' => 'Les notes doivent être une chaîne de caractères.',
            'notes.max' => 'Les notes ne peuvent pas dépasser 1000 caractères.',
        ];
    }
}
