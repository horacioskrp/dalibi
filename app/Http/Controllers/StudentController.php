<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Student::with(['user', 'parentInfo'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($subQuery) use ($search): void {
                $subQuery->where('firstname', 'ilike', "%{$search}%")
                    ->orWhere('lastname', 'ilike', "%{$search}%")
                    ->orWhere('matricule', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search): void {
                        $userQuery->where('firstname', 'ilike', "%{$search}%")
                            ->orWhere('lastname', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        $students = $query->paginate(10)->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search']),
            'stats' => [
                'total' => Student::count(),
                'active' => Student::where('active', true)->count(),
                'inactive' => Student::where('active', false)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Students/Create');
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $studentFillable = array_filter(
                (new Student())->getFillable(),
                static fn (string $column): bool => $column !== 'user_id'
            );

            $studentData = Arr::only($data, $studentFillable);
            $studentData['active'] = (bool) ($studentData['active'] ?? true);

            $student = Student::create($studentData);

            $student->information()->create($data['information']);
            $student->parentInfo()->create($data['parent']);
            $student->medicalInfo()->create($data['medical'] ?? []);
        });

        return redirect()->route('students.index')
            ->with('success', 'Élève créé avec succès.');
    }

    public function show(Student $student): Response
    {
        $student->load(['user', 'information', 'parentInfo', 'medicalInfo']);

        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    public function edit(Student $student): Response
    {
        $student->load(['user', 'information', 'parentInfo', 'medicalInfo']);

        return Inertia::render('Students/Edit', [
            'student' => $student,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $student): void {
            $studentFillable = array_filter(
                (new Student())->getFillable(),
                static fn (string $column): bool => $column !== 'user_id'
            );

            $studentData = Arr::only($data, $studentFillable);
            $studentData['active'] = (bool) ($studentData['active'] ?? $student->active);

            $student->update($studentData);

            $student->information()->updateOrCreate([], $data['information']);
            $student->parentInfo()->updateOrCreate([], $data['parent']);
            $student->medicalInfo()->updateOrCreate([], $data['medical'] ?? []);
        });

        return redirect()->route('students.index')
            ->with('success', 'Élève mis à jour avec succès.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Élève supprimé avec succès.');
    }
}
