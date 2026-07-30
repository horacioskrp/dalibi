<?php

namespace App\Http\Controllers\Rh;

use App\Constants\ContractTypes;
use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeProfileController extends Controller
{
    private const PAYMENT_METHODS = ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE'];
    private const STATUSES        = ['active', 'suspended', 'terminated'];

    public function index(Request $request): Response
    {
        $employees = EmployeeProfile::query()
            ->with('user:id,firstname,lastname,email')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, function ($q) use ($request) {
                $term = '%' . $request->search . '%';
                $q->where(fn ($sub) => $sub
                    ->where('job_title', 'like', $term)
                    ->orWhere('employee_number', 'like', $term)
                    ->orWhereHas('user', fn ($u) => $u->where('firstname', 'like', $term)->orWhere('lastname', 'like', $term)));
            })
            ->orderBy('status')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Rh/Employees/Index', [
            'employees' => $employees,
            'filters'   => $request->only(['status', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Rh/Employees/Create', [
            'users'          => $this->assignableUsers(),
            'contractTypes'  => ContractTypes::options(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request, null);
        $data['employee_number'] = $data['employee_number'] ?: $this->generateNumber();

        EmployeeProfile::create($data);

        return redirect()->route('employees.index')->with('success', 'Employé enregistré avec succès.');
    }

    public function edit(EmployeeProfile $employee): Response
    {
        $employee->load('user:id,firstname,lastname,email');

        return Inertia::render('Rh/Employees/Edit', [
            'employee'      => $employee,
            'contractTypes' => ContractTypes::options(),
        ]);
    }

    public function update(Request $request, EmployeeProfile $employee): RedirectResponse
    {
        $data = $this->validateData($request, $employee);
        unset($data['user_id']); // le rattachement à l'utilisateur n'est pas modifiable

        $employee->update($data);

        return redirect()->route('employees.index')->with('success', 'Employé mis à jour avec succès.');
    }

    public function destroy(EmployeeProfile $employee): RedirectResponse
    {
        if ($employee->payslips()->exists()) {
            return back()->withErrors(['delete' => 'Impossible de supprimer : cet employé a des bulletins de paie.']);
        }

        $employee->delete();

        return back()->with('success', 'Employé supprimé.');
    }

    /* ------------------------------------------------------------------ */

    private function validateData(Request $request, ?EmployeeProfile $employee): array
    {
        return $request->validate([
            'user_id'         => ['required', 'uuid', 'exists:users,id', Rule::unique('employee_profiles', 'user_id')->ignore($employee?->id)],
            'employee_number' => ['nullable', 'string', 'max:50', Rule::unique('employee_profiles', 'employee_number')->ignore($employee?->id)],
            'job_title'       => ['required', 'string', 'max:255'],
            'department'      => ['nullable', 'string', 'max:255'],
            'contract_type'   => ['required', Rule::in(ContractTypes::keys())],
            'hire_date'       => ['nullable', 'date'],
            'end_date'        => ['nullable', 'date', 'after_or_equal:hire_date'],
            'base_salary'     => ['required', 'numeric', 'min:0', 'max:999999999'],
            'payment_method'  => ['required', Rule::in(self::PAYMENT_METHODS)],
            'bank_name'       => ['nullable', 'string', 'max:255'],
            'bank_account'    => ['nullable', 'string', 'max:255'],
            'momo_number'     => ['nullable', 'string', 'max:50'],
            'cnss_number'     => ['nullable', 'string', 'max:50'],
            'status'          => ['required', Rule::in(self::STATUSES)],
            'notes'           => ['nullable', 'string', 'max:1000'],
        ], [
            'user_id.required'  => 'Sélectionnez l\'utilisateur associé.',
            'user_id.unique'    => 'Cet utilisateur a déjà un profil employé.',
            'job_title.required' => 'Le poste est obligatoire.',
            'base_salary.required' => 'Le salaire de base est obligatoire.',
        ]);
    }

    /** Utilisateurs sans profil employé (candidats au rattachement). */
    private function assignableUsers()
    {
        return User::query()
            ->whereDoesntHave('employeeProfile')
            ->orderBy('firstname')
            ->get(['id', 'firstname', 'lastname', 'email'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => trim($u->firstname . ' ' . $u->lastname), 'email' => $u->email]);
    }

    private function generateNumber(): string
    {
        do {
            $number = 'EMP-' . Str::upper(Str::random(5));
        } while (EmployeeProfile::where('employee_number', $number)->exists());

        return $number;
    }
}
