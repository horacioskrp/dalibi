<?php

namespace App\Http\Controllers\Administration;
use App\Http\Controllers\Controller;

use App\Http\Requests\StoreSubjectAssignmentRequest;
use App\Http\Requests\UpdateSubjectAssignmentRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\SubjectAssignment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SubjectAssignment::with(['subject', 'teacher', 'academicYear', 'classroom']);

        if ($request->filled('search')) {
            $searchTerm = strtolower($request->search);
            $query->where(function ($q) use ($searchTerm): void {
                $q->whereHas('subject', fn ($q) =>
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                )
                ->orWhereHas('teacher', fn ($q) =>
                    $q->whereRaw('LOWER(firstname) LIKE ?', ["%{$searchTerm}%"])
                      ->orWhereRaw('LOWER(lastname)  LIKE ?', ["%{$searchTerm}%"])
                )
                ->orWhereHas('classroom', fn ($q) =>
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                );
            });
        }

        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filtre année : par défaut sur l'année active tant qu'aucun paramètre n'est
        // fourni. Un paramètre vide (« Toutes les années ») désactive le filtre.
        $activeYearId = AcademicYear::where('active', true)->orderBy('year', 'desc')->value('id');
        $yearFilter = $request->has('academic_year_id')
            ? $request->input('academic_year_id')
            : $activeYearId;
        if (! empty($yearFilter)) {
            $query->where('academic_year_id', $yearFilter);
        }

        $assignments = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Administration/SubjectAssignments/Index', [
            'assignments'   => $assignments,
            'academicYears' => AcademicYear::orderBy('year', 'desc')->get(['id', 'year']),
            'classrooms'    => Classroom::where('active', true)->orderBy('name')->get(['id', 'name']),
            'filters'       => [
                'search'           => $request->input('search', ''),
                'active'           => $request->input('active'),
                'academic_year_id' => (string) ($yearFilter ?? ''),
                'class_id'         => $request->input('class_id', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        $subjects      = Subject::orderBy('name')->get();
        $teachers      = User::permission('create_marks')->orderBy('firstname')->orderBy('lastname')->get();
        $academicYears = AcademicYear::where('active', true)->orderBy('year', 'desc')->get();
        $classrooms    = Classroom::where('active', true)->orderBy('name')->get();

        return Inertia::render('Administration/SubjectAssignments/Create', [
            'subjects'      => $subjects,
            'teachers'      => $teachers,
            'academicYears' => $academicYears,
            'classrooms'    => $classrooms,
        ]);
    }

    public function store(StoreSubjectAssignmentRequest $request): RedirectResponse
    {
        SubjectAssignment::create($request->validated());

        return redirect()->route('subject-assignments.index')
            ->with('success', 'Affectation créée avec succès.');
    }

    public function show(SubjectAssignment $subjectAssignment): Response
    {
        $subjectAssignment->load(['subject', 'teacher', 'academicYear', 'classroom.type']);

        return Inertia::render('Administration/SubjectAssignments/Show', [
            'assignment' => $subjectAssignment,
        ]);
    }

    public function edit(SubjectAssignment $subjectAssignment): Response
    {
        $subjectAssignment->load(['subject', 'teacher', 'academicYear', 'classroom']);

        $subjects      = Subject::orderBy('name')->get();
        $teachers      = User::permission('create_marks')->orderBy('firstname')->orderBy('lastname')->get();
        $academicYears = AcademicYear::where('active', true)->orderBy('year', 'desc')->get();
        $classrooms    = Classroom::where('active', true)->orderBy('name')->get();

        return Inertia::render('Administration/SubjectAssignments/Edit', [
            'assignment'    => $subjectAssignment,
            'subjects'      => $subjects,
            'teachers'      => $teachers,
            'academicYears' => $academicYears,
            'classrooms'    => $classrooms,
        ]);
    }

    public function update(UpdateSubjectAssignmentRequest $request, SubjectAssignment $subjectAssignment): RedirectResponse
    {
        $subjectAssignment->update($request->validated());

        return redirect()->route('subject-assignments.index')
            ->with('success', 'Affectation mise à jour avec succès.');
    }

    public function destroy(SubjectAssignment $subjectAssignment): RedirectResponse
    {
        abort_unless(
            request()->user()->can('delete_subject_assignments'),
            403
        );

        $subjectAssignment->delete();

        return redirect()->route('subject-assignments.index')
            ->with('success', 'Affectation supprimée avec succès.');
    }
}
