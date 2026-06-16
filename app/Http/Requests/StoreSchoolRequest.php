<?php

namespace App\Http\Requests;

use App\Constants\Roles;
use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:schools,name'],
            'code' => ['required', 'string', 'max:50', 'unique:schools,code'],
            'logo'   => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg,webp', 'max:2048'],
            'devise' => ['nullable', 'string', 'max:500'],
            'terme'  => ['nullable', 'string', 'max:255'],
            'email'  => ['nullable', 'email', 'max:255'],
            'phone'  => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'region'  => ['nullable', 'string', 'max:150'],
            'city'    => ['nullable', 'string', 'max:150'],
            'po_box'  => ['nullable', 'string', 'max:120'],
            'active'  => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de l\'école est requis.',
            'name.unique' => 'Ce nom d\'école existe déjà.',
            'code.required' => 'Le code de l\'école est requis.',
            'code.unique' => 'Ce code d\'école existe déjà.',
            'logo.url' => 'Le logo doit être une URL valide.',
            'email.email' => 'L\'email doit être une adresse valide.',
        ];
    }
}
