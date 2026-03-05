<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $enrollmentId = $this->route('enrollment')?->id;

        return [
            'school_id' => ['required', 'uuid', 'exists:schools,id'],
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'enrollment_code' => ['nullable', 'string', 'max:50', Rule::unique('enrollments', 'enrollment_code')->ignore($enrollmentId)],
            'schooling_id' => ['nullable', 'uuid', 'exists:schoolings,id'],
            'enrollment_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['paid', 'unpaid'])],
        ];
    }

    public function messages(): array
    {
        return [
            'school_id.required' => "L'école est obligatoire.",
            'school_id.exists' => "L'école sélectionnée est invalide.",
            'student_id.required' => "L'élève est obligatoire.",
            'student_id.exists' => "L'élève sélectionné est invalide.",
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.exists' => 'La classe sélectionnée est invalide.',
            'academic_year_id.required' => "L'année académique est obligatoire.",
            'academic_year_id.exists' => "L'année académique sélectionnée est invalide.",
            'enrollment_code.unique' => "Ce code d'inscription existe déjà.",
            'schooling_id.exists' => 'Le tarif sélectionné est invalide.',
            'enrollment_date.required' => "La date d'inscription est obligatoire.",
            'status.required' => 'Le statut est obligatoire.',
        ];
    }
}
