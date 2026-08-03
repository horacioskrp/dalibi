<?php

namespace App\Http\Controllers\Rh;

use App\Http\Controllers\Controller;
use App\Models\PayrollSetting;
use App\Models\SalaryGrade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryGradeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Rh/SalaryGrades/Index', [
            'grades'   => SalaryGrade::withCount('employeeProfiles')
                ->orderBy('sort_order')->orderBy('category')->orderBy('echelon')->get(),
            'settings' => PayrollSetting::current(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Rh/SalaryGrades/Create');
    }

    public function edit(SalaryGrade $salaryGrade): Response
    {
        return Inertia::render('Rh/SalaryGrades/Edit', ['grade' => $salaryGrade]);
    }

    public function store(Request $request): RedirectResponse
    {
        SalaryGrade::create($this->validateData($request));

        return redirect()->route('salary-grades.index')->with('success', 'Grille créée.');
    }

    public function update(Request $request, SalaryGrade $salaryGrade): RedirectResponse
    {
        $salaryGrade->update($this->validateData($request));

        return redirect()->route('salary-grades.index')->with('success', 'Grille mise à jour.');
    }

    public function destroy(SalaryGrade $salaryGrade): RedirectResponse
    {
        if ($salaryGrade->employeeProfiles()->exists()) {
            return back()->withErrors(['delete' => 'Impossible : des employés sont rattachés à cette grille.']);
        }

        $salaryGrade->delete();

        return back()->with('success', 'Grille supprimée.');
    }

    /** Met à jour la règle d'ancienneté (réglages de paie). */
    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'seniority_enabled'       => ['required', 'boolean'],
            'seniority_rate_per_year' => ['required', 'numeric', 'min:0', 'max:100'],
            'seniority_cap_percent'   => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        PayrollSetting::current()->update($data);

        return back()->with('success', 'Réglage d\'ancienneté mis à jour.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'category'    => ['nullable', 'string', 'max:50'],
            'echelon'     => ['nullable', 'integer', 'min:0', 'max:100'],
            'base_amount' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'active'      => ['sometimes', 'boolean'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ], [
            'name.required'        => 'Le nom de la grille est obligatoire.',
            'base_amount.required' => 'Le salaire de base est obligatoire.',
        ]);
    }
}
