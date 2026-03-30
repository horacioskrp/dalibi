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

        if ($request->filled('gender')) {
            $query->where('gender', $request->string('gender')->toString());
        }

        if ($request->filled('nationality')) {
            $query->where('nationality', 'ilike', '%' . $request->string('nationality')->toString() . '%');
        }

        if ($request->filled('status')) {
            $status = $request->string('status')->toString();

            if ($status === 'active') {
                $query->where('active', true);
            } elseif ($status === 'inactive') {
                $query->where('active', false);
            }
        }

        $perPage  = in_array((int) $request->per_page, [10, 25, 50, 100], true)
            ? (int) $request->per_page : 25;

        $students = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'perPage'  => $perPage,
            'filters' => $request->only(['search', 'gender', 'nationality', 'status', 'per_page']),
            'stats' => [
                'total' => Student::count(),
                'active' => Student::where('active', true)->count(),
                'inactive' => Student::where('active', false)->count(),
                'male' => Student::where('gender', 'male')->count(),
                'female' => Student::where('gender', 'female')->count(),
                'other' => Student::whereNull('gender')->orWhere('gender', '')->count(),
            ],
        ]);
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'uuid', 'exists:students,id'],
            'action' => ['required', 'in:activate,deactivate'],
        ]);

        $isActive = $validated['action'] === 'activate';

        $updatedCount = Student::whereIn('id', $validated['student_ids'])
            ->update(['active' => $isActive]);

        $statusLabel = $isActive ? 'activé(s)' : 'désactivé(s)';

        return redirect()->route('students.index')
            ->with('success', "{$updatedCount} élève(s) {$statusLabel} avec succès.");
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
