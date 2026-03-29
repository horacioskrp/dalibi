<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\School;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Enrollment::with(['school', 'student', 'classroom', 'academicYear']);

        if ($request->filled('search')) {
            $searchTerm = $request->string('search')->toString();

            $query->where(function ($subQuery) use ($searchTerm): void {
                $subQuery->where('enrollment_code', 'ilike', "%{$searchTerm}%")
                    ->orWhere('status', 'ilike', "%{$searchTerm}%")
                    ->orWhereHas('student', function ($studentQuery) use ($searchTerm): void {
                        $studentQuery->where('firstname', 'ilike', "%{$searchTerm}%")
                            ->orWhere('lastname', 'ilike', "%{$searchTerm}%")
                            ->orWhere('matricule', 'ilike', "%{$searchTerm}%");
                    })
                    ->orWhereHas('classroom', function ($classroomQuery) use ($searchTerm): void {
                        $classroomQuery->where('name', 'ilike', "%{$searchTerm}%")
                            ->orWhere('code', 'ilike', "%{$searchTerm}%");
                    })
                    ->orWhereHas('academicYear', function ($yearQuery) use ($searchTerm): void {
                        $yearQuery->where('year', 'ilike', "%{$searchTerm}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->string('academic_year_id')->toString());
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->string('class_id')->toString());
        }

        $enrollments = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Enrollments/Index', [
            'enrollments' => $enrollments,
            'filters' => $request->only(['search', 'status', 'academic_year_id', 'class_id']),
            'stats' => [
                'total' => Enrollment::count(),
                'paid' => Enrollment::where('status', 'paid')->count(),
                'unpaid' => Enrollment::where('status', 'unpaid')->count(),
            ],
            'academicYears' => AcademicYear::orderByDesc('year')->get(['id', 'year']),
            'classrooms' => Classroom::where('active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Enrollments/Create', [
            'schools' => School::where('active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'students' => Student::where('active', true)->orderBy('firstname')->orderBy('lastname')->get(['id', 'firstname', 'lastname', 'matricule']),
            'classrooms' => Classroom::where('active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'academicYears' => AcademicYear::orderByDesc('year')->get(['id', 'year', 'active']),
        ]);
    }

    public function store(StoreEnrollmentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['enrollment_code'] = $data['enrollment_code'] ?: $this->generateEnrollmentCode();
        $data['enrolled_by'] = auth()->id();

        $enrollment = Enrollment::create($data);

        return redirect()->route('enrollments.show', $enrollment->id)
            ->with('success', 'Inscription créée avec succès.');
    }

    public function show(Enrollment $enrollment): Response
    {
        $enrollment->load(['school', 'student', 'classroom', 'academicYear', 'enrolledBy']);

        return Inertia::render('Enrollments/Show', [
            'enrollment' => $enrollment,
        ]);
    }

    public function receipt(Enrollment $enrollment): Response
    {
        $enrollment->load(['school', 'student', 'classroom', 'academicYear', 'enrolledBy']);

        return Inertia::render('Enrollments/Receipt', [
            'enrollment' => $enrollment,
        ]);
    }

    public function edit(Enrollment $enrollment): Response
    {
        $enrollment->load(['school', 'student', 'classroom', 'academicYear']);

        return Inertia::render('Enrollments/Edit', [
            'enrollment' => $enrollment,
            'schools' => School::where('active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'students' => Student::where('active', true)->orderBy('firstname')->orderBy('lastname')->get(['id', 'firstname', 'lastname', 'matricule']),
            'classrooms' => Classroom::where('active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'academicYears' => AcademicYear::orderByDesc('year')->get(['id', 'year', 'active']),
        ]);
    }

    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['enrollment_code'])) {
            $data['enrollment_code'] = $enrollment->enrollment_code ?: $this->generateEnrollmentCode();
        }

        $enrollment->update($data);

        return redirect()->route('enrollments.index')
            ->with('success', 'Inscription mise à jour avec succès.');
    }

    public function destroy(Enrollment $enrollment): RedirectResponse
    {
        $enrollment->delete();

        return redirect()->route('enrollments.index')
            ->with('success', 'Inscription supprimée avec succès.');
    }

    private function generateEnrollmentCode(): string
    {
        do {
            $code = 'INS-'.now()->format('Y').'-'.str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (Enrollment::where('enrollment_code', $code)->exists());

        return $code;
    }
}
