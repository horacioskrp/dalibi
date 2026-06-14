<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Enrollment;
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
            $search = strtolower($request->string('search')->toString());
            $query->where(function ($subQuery) use ($search): void {
                $subQuery->whereRaw('LOWER(firstname) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(lastname) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(matricule) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('user', function ($userQuery) use ($search): void {
                        $userQuery->whereRaw('LOWER(firstname) LIKE ?', ["%{$search}%"])
                            ->orWhereRaw('LOWER(lastname) LIKE ?', ["%{$search}%"])
                            ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
                    });
            });
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->string('gender')->toString());
        }

        if ($request->filled('nationality')) {
            $search = strtolower($request->string('nationality')->toString());
            $query->whereRaw('LOWER(nationality) LIKE ?', ["%{$search}%"]);
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
            'stats' => Student::selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN active = true  THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN active = false THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN gender = 'male'   THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female,
                SUM(CASE WHEN gender IS NULL OR gender = '' THEN 1 ELSE 0 END) as other
            ")->first(),
        ]);
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $this->authorize('bulkStatus', Student::class);
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
        $this->authorize('create', Student::class);

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
        $this->authorize('view', $student);

        $student->load(['user', 'information', 'parentInfo', 'medicalInfo']);

        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    public function history(Student $student): Response
    {
        $this->authorize('view', $student);

        $enrollments = Enrollment::query()
            ->with([
                'classroom:id,name,code',
                'academicYear:id,year',
            ])
            ->where('student_id', $student->id)
            ->orderByDesc('enrollment_date')
            ->orderByDesc('created_at')
            ->get()
            ->map(static fn (Enrollment $enrollment): array => [
                'id' => $enrollment->id,
                'classroom' => [
                    'name' => $enrollment->classroom?->name,
                    'code' => $enrollment->classroom?->code,
                ],
                'academic_year' => $enrollment->academicYear?->year,
                'enrollment_date' => $enrollment->enrollment_date?->format('Y-m-d'),
                'enrollment_code' => $enrollment->enrollment_code,
                'status' => $enrollment->status,
            ])
            ->values();

        return Inertia::render('Students/History', [
            'student' => [
                'id' => $student->id,
                'firstname' => $student->firstname,
                'lastname' => $student->lastname,
                'matricule' => $student->matricule,
            ],
            'enrollments' => $enrollments,
        ]);
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

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
        $this->authorize('delete', $student);

        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Élève supprimé avec succès.');
    }
}
