<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectAssignmentRequest;
use App\Http\Requests\UpdateSubjectAssignmentRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\SubjectAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectAssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = SubjectAssignment::with(['subject', 'teacher', 'academicYear', 'classroom']);

        // Search by subject name, teacher name, class name
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('subject', function ($q) use ($searchTerm) {
                    $q->where('name', 'ilike', "%{$searchTerm}%");
                })
                ->orWhereHas('teacher', function ($q) use ($searchTerm) {
                    $q->where(function ($query) use ($searchTerm) {
                        $query->where('firstname', 'ilike', "%{$searchTerm}%")
                              ->orWhere('lastname', 'ilike', "%{$searchTerm}%");
                    });
                })
                ->orWhereHas('classroom', function ($q) use ($searchTerm) {
                    $q->where('name', 'ilike', "%{$searchTerm}%");
                });
            });
        }

        // Filter by active status
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        // Filter by academic year
        if ($request->has('academic_year_id') && $request->academic_year_id) {
            $query->where('academic_year_id', $request->academic_year_id);
        }

        $assignments = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Administration/SubjectAssignments/Index', [
            'assignments' => $assignments,
            'filters' => $request->only(['search', 'active', 'academic_year_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $subjects = Subject::orderBy('name')->get();
        $teachers = User::orderBy('firstname')
            ->orderBy('lastname')
            ->get();
        $academicYears = AcademicYear::where('active', true)
            ->orderBy('start_date', 'desc')
            ->get();
        $classrooms = Classroom::where('active', true)->orderBy('name')->get();

        return Inertia::render('Administration/SubjectAssignments/Create', [
            'subjects' => $subjects,
            'teachers' => $teachers,
            'academicYears' => $academicYears,
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubjectAssignmentRequest $request)
    {
        SubjectAssignment::create($request->validated());

        return redirect()->route('subject-assignments.index')
            ->with('success', 'Affectation créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SubjectAssignment $subjectAssignment): Response
    {
        $subjectAssignment->load(['subject', 'teacher', 'academicYear', 'classroom.classroomType']);

        return Inertia::render('Administration/SubjectAssignments/Show', [
            'assignment' => $subjectAssignment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubjectAssignment $subjectAssignment): Response
    {
        $subjectAssignment->load(['subject', 'teacher', 'academicYear', 'classroom']);
        
        $subjects = Subject::orderBy('name')->get();
        $teachers = User::orderBy('firstname')
            ->orderBy('lastname')
            ->get();
        $academicYears = AcademicYear::where('active', true)
            ->orderBy('start_date', 'desc')
            ->get();
        $classrooms = Classroom::where('active', true)->orderBy('name')->get();

        return Inertia::render('Administration/SubjectAssignments/Edit', [
            'assignment' => $subjectAssignment,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'academicYears' => $academicYears,
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubjectAssignmentRequest $request, SubjectAssignment $subjectAssignment)
    {
        $subjectAssignment->update($request->validated());

        return redirect()->route('subject-assignments.index')
            ->with('success', 'Affectation mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubjectAssignment $subjectAssignment)
    {
        $subjectAssignment->delete();

        return redirect()->route('subject-assignments.index')
            ->with('success', 'Affectation supprimée avec succès.');
    }
}
