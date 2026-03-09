<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student')?->id;

        return [
            'matricule' => ['nullable', 'string', 'max:50', Rule::unique('students', 'matricule')->ignore($studentId)],
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birth_date' => ['required', 'date'],
            'place_of_birth' => ['nullable', 'string', 'max:255'],
            'nationality' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('students', 'email')->ignore($studentId)],
            'profile_photo' => ['nullable', 'string', 'max:255'],
            'active' => ['nullable', 'boolean'],

            'information.birth_certificate_number' => ['nullable', 'string', 'max:255'],
            'information.birth_certificate_issue_date' => ['nullable', 'date'],
            'information.birth_certificate_issue_place' => ['nullable', 'string', 'max:255'],
            'information.admission_type' => ['required', Rule::in(['new', 'transfer', 're_admission'])],

            'parent.father_firstname' => ['required', 'string', 'max:255'],
            'parent.father_lastname' => ['required', 'string', 'max:255'],
            'parent.father_profession' => ['nullable', 'string', 'max:255'],
            'parent.father_phone' => ['nullable', 'string', 'max:255'],
            'parent.mother_firstname' => ['required', 'string', 'max:255'],
            'parent.mother_lastname' => ['required', 'string', 'max:255'],
            'parent.mother_profession' => ['nullable', 'string', 'max:255'],
            'parent.mother_phone' => ['nullable', 'string', 'max:255'],
            'parent.email' => ['nullable', 'email', 'max:255'],

            'medical.blood_group' => ['nullable', 'string', 'max:255'],
            'medical.allergies' => ['nullable', 'string', 'max:1000'],
            'medical.vaccinations' => ['nullable', 'string', 'max:1000'],
            'medical.emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'medical.emergency_contact_phone' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'firstname.required' => "Le prénom est obligatoire.",
            'lastname.required' => "Le nom est obligatoire.",
            'gender.required' => "Le genre est obligatoire.",
            'birth_date.required' => "La date de naissance est obligatoire.",
            'information.admission_type.required' => "Le type d'admission est obligatoire.",
            'parent.father_firstname.required' => "Le prénom du père est obligatoire.",
            'parent.father_lastname.required' => "Le nom du père est obligatoire.",
            'parent.mother_firstname.required' => "Le prénom de la mère est obligatoire.",
            'parent.mother_lastname.required' => "Le nom de la mère est obligatoire.",
            'matricule.unique' => "Ce matricule existe déjà.",
            'email.unique' => "Cet email existe déjà.",
        ];
    }
}
