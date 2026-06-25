<?php

namespace App\Http\Controllers\Notes;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\AcademicYear;
use App\Models\AttendanceRecord;
use App\Models\BulletinTemplate;
use App\Models\Classroom;
use App\Models\ClassSubject;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\GradingConfig;
use App\Models\ReportCard;
use App\Models\School;
use App\Models\Student;
use App\Models\SubjectAssignment;
use App\Services\BulletinRenderer;
use App\Services\GradingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BulletinController extends Controller
{
    public function __construct(private readonly GradingService $grading)
    {
    }

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('view_grades'), 403);

        $classId  = $request->string('class_id')->toString();
        $periodId = $request->string('academic_period_id')->toString();
        $year     = AcademicYear::where('active', true)->first(['id', 'year']);

        $classrooms = Classroom::where('active', true)->orderBy('name')->get(['id', 'name', 'classroom_type_id']);

        $periods = collect();
        if ($classId !== '') {
            $class = Classroom::find($classId, ['id', 'classroom_type_id']);
            $periods = AcademicPeriod::forClassType($year?->id, $class?->classroom_type_id)
                ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'is_current' => (bool) $p->is_current])
                ->values();
        }

        $rows = [];
        if ($classId !== '' && $periodId !== '') {
            $class         = Classroom::with('classroomType')->findOrFail($classId);
            $config        = GradingConfig::resolveOrDefault(School::query()->first(), $class->classroomType);
            $classSubjects = $this->classSubjects($class, $year?->id);
            $students      = $this->activeStudents($classId, $year?->id);

            $averages = $students->map(fn ($s) => [
                'student_id' => $s->id,
                'average'    => $this->grading->periodAverageFromEvaluations($s->id, $periodId, $classSubjects, $config)['average'],
            ]);
            $ranking = $this->grading->rank($averages);

            $cards = ReportCard::where('academic_period_id', $periodId)
                ->whereIn('student_id', $students->pluck('id'))
                ->pluck('id', 'student_id');

            $rows = $students->map(function ($s) use ($ranking, $config, $cards) {
                $info = $ranking->get($s->id, ['average' => null, 'rank' => null]);

                return [
                    'student_id'     => $s->id,
                    'name'           => $s->lastname . ' ' . $s->firstname,
                    'matricule'      => $s->matricule,
                    'average'        => $info['average'],
                    'rank'           => $info['rank'],
                    'mention'        => $this->grading->mention($info['average'], $config),
                    'validated'      => $cards->has($s->id),
                    'report_card_id' => $cards->get($s->id),
                ];
            })->values();
        }

        return Inertia::render('Notes/Bulletins/Index', [
            'classrooms' => $classrooms,
            'periods'    => $periods,
            'rows'       => $rows,
            'activeYear' => $year,
            'filters'    => ['class_id' => $classId, 'academic_period_id' => $periodId],
        ]);
    }

    /** Valide (fige) les bulletins de toute la classe pour une période. */
    public function validateClass(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('create_grades'), 403);

        $validated = $request->validate([
            'class_id'           => ['required', 'uuid', 'exists:classes,id'],
            'academic_period_id' => ['required', 'uuid', 'exists:academic_periods,id'],
            'observations'       => ['nullable', 'string', 'max:1000'],
        ]);

        $year   = AcademicYear::where('active', true)->first();
        $class  = Classroom::with('classroomType')->findOrFail($validated['class_id']);
        $period = AcademicPeriod::findOrFail($validated['academic_period_id']);
        $school   = School::query()->first();
        $config   = GradingConfig::resolveOrDefault($school, $class->classroomType);
        $template = BulletinTemplate::resolveOrDefault($school, $class->classroomType);
        $typeIds  = $template->referencedEvaluationTypeIds();

        $classSubjects = $this->classSubjects($class, $year?->id);
        $students      = $this->activeStudents($class->id, $year?->id);
        $effectif      = $students->count();

        // Professeur par matière + appréciations (commentaires saisis) + absences.
        $teachers    = $this->teachersBySubject($class->id, $year?->id);
        $comments    = $this->commentsByStudentSubject($classSubjects->pluck('id'), $period->id);
        $absences    = $this->absencesByStudent($class->id, $period);

        // Matrice des valeurs (Classe/Compo/Moyenne + moyennes par type) par matière et par élève.
        $matrix = [];
        foreach ($classSubjects as $cs) {
            foreach ($students as $s) {
                $cc  = $this->grading->subjectClasseCompo($cs, $s->id, $period->id);
                $moy = $this->grading->combineClasseCompo($cc['classe'], $cc['compo'], $config);

                $byType = [];
                foreach ($typeIds as $typeId) {
                    $byType[$typeId] = $this->grading->subjectAverageByType($cs, $s->id, $period->id, $typeId);
                }

                $matrix[$cs->id][$s->id] = ['classe' => $cc['classe'], 'compo' => $cc['compo'], 'moy' => $moy, 'by_type' => $byType];
            }
        }

        // Classements (global + par matière).
        $averages = $students->map(fn ($s) => [
            'student_id' => $s->id,
            'average'    => $this->grading->periodAverageFromEvaluations($s->id, $period->id, $classSubjects, $config)['average'],
        ]);
        $ranking = $this->grading->rank($averages);

        // Statistiques de la classe.
        $values     = $averages->pluck('average')->filter(fn ($v) => $v !== null);
        $classStats = [
            'highest' => $values->isNotEmpty() ? $values->max() : null,
            'lowest'  => $values->isNotEmpty() ? $values->min() : null,
            'average' => $values->isNotEmpty() ? round($values->avg(), 2) : null,
        ];
        $periodSystem = $class->classroomType?->period_system ?? 'trimestre';
        $retards      = $this->retardsByStudent($class->id, $period);

        // Récapitulatif inter-périodes + annuel (classements précalculés une fois).
        $allPeriods     = AcademicPeriod::forClassType($year?->id, $class->classroom_type_id);
        $periodRankings = [];
        foreach ($allPeriods as $pp) {
            $rows = $students->map(fn ($s) => [
                'student_id' => $s->id,
                'average'    => $this->grading->periodAverageFromEvaluations($s->id, $pp->id, $classSubjects, $config)['average'],
            ]);
            $periodRankings[$pp->id] = $this->grading->rank($rows);
        }
        $annualRanking = $this->grading->rank($students->map(fn ($s) => [
            'student_id' => $s->id,
            'average'    => $this->grading->annualAverage($s->id, $allPeriods, $classSubjects, $config),
        ]));

        $subjectRanks = [];
        foreach ($classSubjects as $cs) {
            $rows = $students->map(fn ($s) => ['student_id' => $s->id, 'average' => $matrix[$cs->id][$s->id]['moy']]);
            $subjectRanks[$cs->id] = $this->grading->rank($rows);
        }

        DB::transaction(function () use (
            $students, $classSubjects, $matrix, $subjectRanks, $ranking, $config, $teachers,
            $comments, $absences, $class, $period, $year, $effectif, $request, $validated,
            $template, $classStats, $periodSystem, $retards, $allPeriods, $periodRankings, $annualRanking
        ): void {
            foreach ($students as $student) {
                $lines = [];
                $totalCoeff = 0.0;
                $totalPoints = 0.0;

                foreach ($classSubjects as $cs) {
                    $cell   = $matrix[$cs->id][$student->id];
                    $coeff  = (float) $cs->coefficient;
                    $points = $cell['moy'] !== null ? round($cell['moy'] * $coeff, 2) : null;

                    if ($cell['moy'] !== null) {
                        $totalCoeff  += $coeff;
                        $totalPoints += $points;
                    }

                    $lines[] = [
                        'subject'      => $cs->subject?->name ?? '',
                        'parent'       => $cs->subject?->parent?->name,
                        'group'        => $cs->group ?? 'obligatoire',
                        'coefficient'  => $coeff,
                        'classe'       => $cell['classe'],
                        'compo'        => $cell['compo'],
                        'moyenne'      => $cell['moy'],
                        'points'       => $points,
                        'definitive'   => $points,
                        'by_type'      => $cell['by_type'] ?? [],
                        'rang'         => $subjectRanks[$cs->id]->get($student->id)['rank'] ?? null,
                        'appreciation' => $comments[$student->id . '|' . $cs->id] ?? '',
                        'teacher'      => $teachers[$cs->subject_id] ?? '',
                    ];
                }

                $info    = $ranking->get($student->id, ['average' => null, 'rank' => null]);
                $average = $info['average'];

                $recap = ['periods' => [], 'annual' => $annualRanking->get($student->id, ['average' => null, 'rank' => null])];
                foreach ($allPeriods as $pp) {
                    $r = $periodRankings[$pp->id]->get($student->id, ['average' => null, 'rank' => null]);
                    $recap['periods'][] = ['name' => $pp->name, 'average' => $r['average'], 'rank' => $r['rank']];
                }

                $payload = [
                    'student'      => ['name' => $student->lastname . ' ' . $student->firstname, 'matricule' => $student->matricule],
                    'class'        => ['name' => $class->name],
                    'period'       => ['name' => $period->name, 'system' => $periodSystem],
                    'year'         => $year?->year,
                    'effectif'     => $effectif,
                    'absences'     => $absences[$student->id] ?? 0,
                    'retards'      => $retards[$student->id] ?? 0,
                    'punitions'    => 0,
                    'exclusions'   => 0,
                    'decision'     => $this->grading->mention($average, $config) ?? '',
                    'recap'        => $recap,
                    'lines'        => $lines,
                    'total_coeff'  => $totalCoeff,
                    'total_points' => round($totalPoints, 2),
                    'average'      => $average,
                    'rank'         => $info['rank'],
                    'mention'      => $this->grading->mention($average, $config),
                    'observations' => $validated['observations'] ?? '',
                    'class_stats'  => $classStats,
                    'template'     => ['columns' => $template->columns, 'options' => $template->options],
                ];

                $card = ReportCard::firstOrNew([
                    'student_id'         => $student->id,
                    'academic_period_id' => $period->id,
                ]);

                if (! $card->exists) {
                    $card->reference = $this->reference($year?->year);
                }

                $card->fill([
                    'class_id'         => $class->id,
                    'academic_year_id' => $year?->id,
                    'average'          => $average,
                    'rank'             => $info['rank'],
                    'mention'          => $payload['mention'],
                    'payload'          => $payload,
                    'locked_at'        => now(),
                    'generated_by'     => $request->user()->id,
                ])->save();
            }
        });

        return back()->with('message', "Bulletins validés pour {$effectif} élève(s).");
    }

    public function download(Request $request, Student $student)
    {
        abort_unless($request->user()->can('view_grades'), 403);

        $periodId = $request->string('academic_period_id')->toString();

        $card = ReportCard::with('student')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->firstOrFail();

        $school = School::query()->first() ?? new School();

        $html = app(BulletinRenderer::class)->render($card, $school);

        $filename = Str::slug('bulletin-' . $student->lastname . '-' . $student->firstname . '-' . ($card->payload['period']['name'] ?? '')) . '.pdf';

        return Pdf::loadHTML($html)->setPaper('a4', 'portrait')->download($filename);
    }

    /** Écran d'édition d'un bulletin validé (appréciations, observations, discipline). */
    public function editCard(Request $request, ReportCard $reportCard): Response
    {
        abort_unless($request->user()->can('create_grades'), 403);

        $p = $reportCard->payload;

        return Inertia::render('Notes/Bulletins/Edit', [
            'card' => [
                'id'           => $reportCard->id,
                'student'      => $p['student'] ?? [],
                'period'       => $p['period'] ?? [],
                'observations' => $p['observations'] ?? '',
                'decision'     => $p['decision'] ?? ($p['mention'] ?? ''),
                'retards'      => $p['retards'] ?? 0,
                'absences'     => $p['absences'] ?? 0,
                'punitions'    => $p['punitions'] ?? 0,
                'exclusions'   => $p['exclusions'] ?? 0,
                'lines'        => collect($p['lines'] ?? [])->map(fn ($l, $i) => [
                    'index'        => $i,
                    'subject'      => $l['subject'] ?? '',
                    'moyenne'      => $l['moyenne'] ?? null,
                    'appreciation' => $l['appreciation'] ?? '',
                ])->values(),
            ],
        ]);
    }

    /** Enregistre les champs éditables dans le snapshot (sans recalcul des notes). */
    public function updateCard(Request $request, ReportCard $reportCard): RedirectResponse
    {
        abort_unless($request->user()->can('create_grades'), 403);

        $validated = $request->validate([
            'appreciations'   => ['array'],
            'appreciations.*' => ['nullable', 'string', 'max:255'],
            'observations'    => ['nullable', 'string', 'max:1000'],
            'decision'        => ['nullable', 'string', 'max:150'],
            'punitions'       => ['nullable', 'integer', 'min:0'],
            'exclusions'      => ['nullable', 'integer', 'min:0'],
        ]);

        $payload = $reportCard->payload;

        foreach ($validated['appreciations'] ?? [] as $index => $text) {
            if (isset($payload['lines'][$index])) {
                $payload['lines'][$index]['appreciation'] = $text ?? '';
            }
        }

        $payload['observations'] = $validated['observations'] ?? ($payload['observations'] ?? '');
        $payload['decision']     = $validated['decision'] ?? ($payload['decision'] ?? '');
        $payload['punitions']    = $validated['punitions'] ?? 0;
        $payload['exclusions']   = $validated['exclusions'] ?? 0;

        $reportCard->update(['payload' => $payload]);

        return redirect()->route('bulletins.index', [
            'class_id' => $reportCard->class_id,
            'academic_period_id' => $reportCard->academic_period_id,
        ])->with('message', 'Bulletin mis à jour.');
    }

    /** @return \Illuminate\Support\Collection<int, ClassSubject> */
    private function classSubjects(Classroom $class, ?string $yearId)
    {
        return ClassSubject::where('class_id', $class->id)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->with(['subject:id,name,code,parent_id', 'subject.parent:id,name'])
            ->get()
            // Regroupe les sous-matières sous leur matière parente.
            ->sortBy(fn ($cs) => ($cs->subject?->parent?->name ?? $cs->subject?->name) . '~' . ($cs->subject?->name))
            ->values();
    }

    /** @return \Illuminate\Support\Collection<int, Student> */
    private function activeStudents(string $classId, ?string $yearId)
    {
        $ids = Enrollment::where('class_id', $classId)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->where('status', 'active')
            ->pluck('student_id');

        return Student::whereIn('id', $ids)
            ->orderBy('lastname')->orderBy('firstname')
            ->get(['id', 'firstname', 'lastname', 'matricule']);
    }

    /** @return array<string, string> subject_id => nom du professeur */
    private function teachersBySubject(string $classId, ?string $yearId): array
    {
        return SubjectAssignment::where('class_id', $classId)
            ->where('active', true)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->with('teacher:id,firstname,lastname')
            ->get()
            ->mapWithKeys(fn ($a) => [$a->subject_id => trim(($a->teacher?->firstname ?? '') . ' ' . ($a->teacher?->lastname ?? ''))])
            ->toArray();
    }

    /** @return array<string, string> "studentId|classSubjectId" => appréciation */
    private function commentsByStudentSubject($classSubjectIds, string $periodId): array
    {
        return Grade::whereIn('class_subject_id', $classSubjectIds)
            ->where('academic_period_id', $periodId)
            ->whereNotNull('comments')
            ->get(['student_id', 'class_subject_id', 'comments'])
            ->mapWithKeys(fn ($g) => [$g->student_id . '|' . $g->class_subject_id => $g->comments])
            ->toArray();
    }

    /** @return array<string, int> student_id => nombre d'absences sur la période */
    private function absencesByStudent(string $classId, AcademicPeriod $period): array
    {
        return $this->attendanceCountByStudent($classId, $period, 'absent');
    }

    /** @return array<string, int> student_id => nombre de retards sur la période */
    private function retardsByStudent(string $classId, AcademicPeriod $period): array
    {
        return $this->attendanceCountByStudent($classId, $period, 'late');
    }

    /** @return array<string, int> */
    private function attendanceCountByStudent(string $classId, AcademicPeriod $period, string $status): array
    {
        return AttendanceRecord::where('status', $status)
            ->whereHas('attendance', fn ($q) => $q->where('class_id', $classId)->where('academic_period_id', $period->id))
            ->get(['student_id'])
            ->countBy('student_id')
            ->map(fn ($v) => (int) $v)
            ->toArray();
    }

    private function reference(?string $year): string
    {
        $y = $year ? preg_replace('/\D/', '', substr($year, 0, 4)) : Carbon::now()->year;
        $count = ReportCard::where('reference', 'like', "BUL-{$y}-%")->count() + 1;

        return sprintf('BUL-%s-%04d', $y, $count);
    }
}
