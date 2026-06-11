<?php

/**
 * Projet : Système de Gestion Scolaire (SIGE) - Togo
 * Description : Gestion des élèves, des notes et des bulletins.
 * * Copyright (c) 2026 Kudayah Sassou Horacio Herve.
 * * Ce programme est un logiciel libre : vous pouvez le redistribuer et/ou le modifier
 * selon les termes de la Licence Publique Générale GNU (GPL v3) telle que publiée
 * par la Free Software Foundation.
 */

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\ClassSubject;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GradeController extends Controller
{
    /**
     * Display the grade entry page with filters.
     */
    public function index(Request $request): Response
    {
        $classId = $request->string('class_id')->toString();
        $classSubjectId = $request->string('class_subject_id')->toString();
        $term = $request->string('term')->toString();

        $activeYear = AcademicYear::where('active', true)->first(['id', 'year']);

        $classrooms = Classroom::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $classSubjects = [];
        if ($classId !== '') {
            $classSubjects = ClassSubject::where('class_id', $classId)
                ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
                ->with('subject:id,name,code')
                ->get(['id', 'class_id', 'subject_id', 'coefficient'])
                ->map(fn ($cs) => [
                    'id' => $cs->id,
                    'coefficient' => $cs->coefficient,
                    'subject' => $cs->subject,
                ]);
        }

        $studentsWithGrades = [];
        $stats = ['total' => 0, 'graded' => 0, 'average' => null];

        if ($classSubjectId !== '' && in_array($term, ['term1', 'term2', 'term3'], true)) {
            $enrollments = Enrollment::where('class_id', $classId)
                ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
                ->where('status', 'active')
                ->with('student:id,firstname,lastname,matricule')
                ->get();

            $existingGrades = Grade::where('class_subject_id', $classSubjectId)
                ->where('term', $term)
                ->get()
                ->keyBy('student_id');

            $studentsWithGrades = $enrollments->map(function ($enrollment) use ($existingGrades) {
                $grade = $existingGrades->get($enrollment->student_id);

                return [
                    'student_id' => $enrollment->student_id,
                    'student' => $enrollment->student,
                    'grade_id' => $grade?->id,
                    'score' => $grade?->score !== null ? (float) $grade->score : null,
                    'comments' => $grade?->comments,
                ];
            })->values();

            $gradedCount = $existingGrades->filter(fn ($g) => $g->score !== null)->count();
            $scores = $existingGrades->filter(fn ($g) => $g->score !== null)->pluck('score');
            $average = $scores->count() > 0 ? round($scores->avg(), 2) : null;

            $stats = [
                'total' => $enrollments->count(),
                'graded' => $gradedCount,
                'average' => $average,
            ];
        }

        return Inertia::render('Grades/Index', [
            'classrooms' => $classrooms,
            'classSubjects' => $classSubjects,
            'studentsWithGrades' => $studentsWithGrades,
            'activeYear' => $activeYear,
            'stats' => $stats,
            'filters' => [
                'class_id' => $classId,
                'class_subject_id' => $classSubjectId,
                'term' => $term,
            ],
        ]);
    }

    /**
     * Bulk upsert grades for a class-subject and term.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_subject_id' => ['required', 'uuid', 'exists:class_subjects,id'],
            'term' => ['required', 'in:term1,term2,term3'],
            'grades' => ['required', 'array', 'min:1'],
            'grades.*.student_id' => ['required', 'uuid', 'exists:students,id'],
            'grades.*.score' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'grades.*.comments' => ['nullable', 'string', 'max:500'],
        ], [
            'class_subject_id.required' => 'La matière est obligatoire.',
            'term.required' => 'Le trimestre est obligatoire.',
            'grades.required' => 'Aucune note à enregistrer.',
            'grades.*.score.min' => 'La note minimale est 0.',
            'grades.*.score.max' => 'La note maximale est 20.',
        ]);

        DB::transaction(function () use ($validated): void {
            foreach ($validated['grades'] as $gradeData) {
                Grade::updateOrCreate(
                    [
                        'student_id' => $gradeData['student_id'],
                        'class_subject_id' => $validated['class_subject_id'],
                        'term' => $validated['term'],
                    ],
                    [
                        'score' => $gradeData['score'] ?? null,
                        'comments' => $gradeData['comments'] ?? null,
                    ]
                );
            }
        });

        return back()->with('message', 'Notes enregistrées avec succès.');
    }

    /**
     * Display the grade bulletin for a student.
     */
    public function student(Student $student, Request $request): Response
    {
        $term = $request->string('term', 'term1')->toString();
        if (! in_array($term, ['term1', 'term2', 'term3'], true)) {
            $term = 'term1';
        }

        $activeYear = AcademicYear::where('active', true)->first(['id', 'year']);

        $enrollment = Enrollment::where('student_id', $student->id)
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->where('status', 'active')
            ->with('classroom:id,name,code')
            ->first();

        $grades = collect();
        $average = null;

        if ($enrollment) {
            $classSubjects = ClassSubject::where('class_id', $enrollment->class_id)
                ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
                ->with([
                    'subject:id,name,code',
                    'grades' => fn ($q) => $q->where('student_id', $student->id)->where('term', $term),
                ])
                ->get();

            $grades = $classSubjects->map(fn ($cs) => [
                'class_subject_id' => $cs->id,
                'subject' => $cs->subject,
                'coefficient' => (float) $cs->coefficient,
                'score' => $cs->grades->first()?->score !== null ? (float) $cs->grades->first()->score : null,
                'comments' => $cs->grades->first()?->comments,
            ]);

            $withScores = $grades->filter(fn ($g) => $g['score'] !== null);
            if ($withScores->count() > 0) {
                $totalCoef = $withScores->sum('coefficient');
                $weightedSum = $withScores->sum(fn ($g) => $g['score'] * $g['coefficient']);
                $average = $totalCoef > 0 ? round($weightedSum / $totalCoef, 2) : null;
            }
        }

        return Inertia::render('Grades/Student', [
            'student' => $student->only(['id', 'firstname', 'lastname', 'matricule']),
            'enrollment' => $enrollment,
            'grades' => $grades->values(),
            'average' => $average,
            'term' => $term,
            'activeYear' => $activeYear,
        ]);
    }
}
