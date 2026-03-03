<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectAssignmentRequest extends FormRequest
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
            'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'teacher_id' => ['required', 'uuid', 'exists:users,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
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
            'subject_id.required' => 'La matière est obligatoire.',
            'subject_id.uuid' => "L'identifiant de la matière n'est pas valide.",
            'subject_id.exists' => "La matière sélectionnée n'existe pas.",
            'teacher_id.required' => "L'enseignant est obligatoire.",
            'teacher_id.uuid' => "L'identifiant de l'enseignant n'est pas valide.",
            'teacher_id.exists' => "L'enseignant sélectionné n'existe pas.",
            'academic_year_id.required' => "L'année académique est obligatoire.",
            'academic_year_id.uuid' => "L'identifiant de l'année académique n'est pas valide.",
            'academic_year_id.exists' => "L'année académique sélectionnée n'existe pas.",
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.uuid' => "L'identifiant de la classe n'est pas valide.",
            'class_id.exists' => "La classe sélectionnée n'existe pas.",
            'notes.max' => 'Les notes ne peuvent pas dépasser 500 caractères.',
        ];
    }
}
