<?php

namespace App\Http\Requests;

use App\Constants\Roles;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGradingConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('edit_grading_configs');
    }

    public function rules(): array
    {
        return [
            'school_id'         => ['required', 'uuid', 'exists:schools,id'],
            'name'              => ['required', 'string', 'max:150'],
            'passing_score'     => ['required', 'numeric', 'min:0', 'max:100'],
            'default_max_score' => ['required', 'numeric', 'min:1', 'max:100'],
            'term1_weight'      => ['required', 'numeric', 'min:0', 'max:10'],
            'term2_weight'      => ['required', 'numeric', 'min:0', 'max:10'],
            'term3_weight'      => ['required', 'numeric', 'min:0', 'max:10'],
            'round_precision'   => ['required', 'integer', 'in:0,1,2,3'],
        ];
    }

    public function messages(): array
    {
        return [
            'school_id.required'         => "L'établissement est obligatoire.",
            'school_id.exists'           => "L'établissement sélectionné n'existe pas.",
            'name.required'              => 'Le nom est obligatoire.',
            'passing_score.required'     => 'Le seuil de passage est obligatoire.',
            'default_max_score.required' => 'La note maximale est obligatoire.',
            'term1_weight.required'      => 'Le poids du trimestre 1 est obligatoire.',
            'term2_weight.required'      => 'Le poids du trimestre 2 est obligatoire.',
            'term3_weight.required'      => 'Le poids du trimestre 3 est obligatoire.',
            'round_precision.in'         => 'La précision doit être 0, 1, 2 ou 3.',
        ];
    }
}
