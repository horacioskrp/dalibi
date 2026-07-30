<?php

namespace App\Http\Controllers\Rh;

use App\Http\Controllers\Controller;
use App\Models\SalaryComponent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalaryComponentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Rh/SalaryComponents/Index', [
            'components' => SalaryComponent::orderBy('type')->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        SalaryComponent::create($this->validateData($request));

        return back()->with('success', 'Rubrique ajoutée.');
    }

    public function update(Request $request, SalaryComponent $salaryComponent): RedirectResponse
    {
        $salaryComponent->update($this->validateData($request));

        return back()->with('success', 'Rubrique mise à jour.');
    }

    public function destroy(SalaryComponent $salaryComponent): RedirectResponse
    {
        $salaryComponent->delete();

        return back()->with('success', 'Rubrique supprimée.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'code'           => ['nullable', 'string', 'max:50'],
            'type'           => ['required', Rule::in([SalaryComponent::EARNING, SalaryComponent::DEDUCTION])],
            'default_amount' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'is_default'     => ['sometimes', 'boolean'],
            'active'         => ['sometimes', 'boolean'],
            'sort_order'     => ['nullable', 'integer', 'min:0'],
        ], [
            'name.required' => 'Le nom de la rubrique est obligatoire.',
            'type.in'       => 'Type invalide (gain ou retenue).',
        ]);
    }
}
