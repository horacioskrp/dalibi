<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassSubjectRequest;
use App\Http\Requests\UpdateClassSubjectRequest;
use App\Models\AcademicYear;
use App\Models\ClassSubject;
use App\Models\Classroom;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClassSubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $query = ClassSubject::query()
            ->with(['class:id,name,code', 'subject:id,name,code', 'academicYear:id,year,start_date,end_date']);

        if (request('search')) {
            $search = request('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('class', function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%");
                })
                ->orWhereHas('subject', function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%");
                });
            });
        }

        if (request('class_id')) {
            $query->where('class_id', request('class_id'));
        }

        if (request('academic_year_id')) {
            $query->where('academic_year_id', request('academic_year_id'));
        }

        $classSubjects = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(fn ($item) => [
                'id' => $item->id,
                'class_id' => $item->class_id,
                'subject_id' => $item->subject_id,
                'academic_year_id' => $item->academic_year_id,
                'created_at' => $item->created_at,
                'class' => $item->class,
                'subject' => $item->subject,
                'academicYear' => $item->academicYear,
            ])
            ->withQueryString();

        return Inertia::render('Administration/ClassSubjects/Index', [
            'classSubjects' => $classSubjects,
            'filters' => request()->only(['search', 'class_id', 'academic_year_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $classrooms = Classroom::where('active', true)
            ->orderBy('name')
            ->get();
        $subjects = Subject::orderBy('name')->get();
        $academicYears = AcademicYear::where('active', true)
            ->select(['id', 'year', 'start_date', 'end_date'])
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Administration/ClassSubjects/Create', [
            'classrooms' => $classrooms,
            'subjects' => $subjects,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClassSubjectRequest $request)
    {
        $validated = $request->validated();
        $subjectIds = $validated['subject_ids'];

        DB::transaction(function () use ($validated, $subjectIds): void {
            foreach ($subjectIds as $subjectId) {
                ClassSubject::firstOrCreate([
                    'class_id' => $validated['class_id'],
                    'subject_id' => $subjectId,
                    'academic_year_id' => $validated['academic_year_id'],
                ]);
            }
        });

        return redirect()->route('class-subjects.index')
            ->with('message', 'Matières attribuées à la classe avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassSubject $classSubject): Response
    {
        $classSubject->load(['class', 'subject', 'academicYear', 'grades']);

        return Inertia::render('Administration/ClassSubjects/Show', [
            'classSubject' => $classSubject,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClassSubject $classSubject): Response
    {
        $classrooms = Classroom::where('active', true)
            ->orderBy('name')
            ->get();
        
        // Get all subjects and mark the ones already assigned for this class+year
        $subjects = Subject::orderBy('name')->get();
        $assignedSubjectIds = ClassSubject::where('class_id', $classSubject->class_id)
            ->where('academic_year_id', $classSubject->academic_year_id)
            ->pluck('subject_id')
            ->toArray();
        
        $academicYears = AcademicYear::where('active', true)
            ->select(['id', 'year', 'start_date', 'end_date'])
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Administration/ClassSubjects/Edit', [
            'classSubject' => $classSubject,
            'classrooms' => $classrooms,
            'subjects' => $subjects,
            'assignedSubjectIds' => $assignedSubjectIds,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClassSubjectRequest $request, ClassSubject $classSubject)
    {
        $validated = $request->validated();
        $subjectIds = $validated['subject_ids'];

        DB::transaction(function () use ($validated, $subjectIds, $classSubject): void {
            $oldClassId = $classSubject->class_id;
            $oldAcademicYearId = $classSubject->academic_year_id;

            $newClassId = $validated['class_id'];
            $newAcademicYearId = $validated['academic_year_id'];

            ClassSubject::where('class_id', $oldClassId)
                ->where('academic_year_id', $oldAcademicYearId)
                ->delete();

            ClassSubject::where('class_id', $newClassId)
                ->where('academic_year_id', $newAcademicYearId)
                ->delete();

            foreach ($subjectIds as $subjectId) {
                ClassSubject::create([
                    'class_id' => $newClassId,
                    'subject_id' => $subjectId,
                    'academic_year_id' => $newAcademicYearId,
                ]);
            }
        });

        return redirect()->route('class-subjects.index')
            ->with('message', 'Attribution mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassSubject $classSubject)
    {
        $classSubject->delete();

        return redirect()->route('class-subjects.index')
            ->with('message', 'Attribution supprimée avec succès.');
    }
}
