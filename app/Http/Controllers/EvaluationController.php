<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Evaluation;
use App\Models\EvaluationType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationController extends Controller
{
    private const MSG_EVALUATION_NAME_REQUIRED = 'Le nom de l\'évaluation est obligatoire.';

    private const MSG_EVALUATION_TYPE_REQUIRED = 'Le type d\'évaluation est obligatoire.';

    private const MSG_COEFFICIENT_GT_ZERO = 'Le coefficient doit être supérieur à 0.';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $classId = $request->string('class_id')->toString();
        $evaluationTypeId = $request->string('evaluation_type_id')->toString();

        $query = Evaluation::query()
            ->with([
                'evaluationType:id,name',
                'classroom:id,name,code',
                'academicPeriod:id,name',
            ]);

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhereHas('classroom', function ($classroomQuery) use ($search): void {
                        $classroomQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    })
                    ->orWhereHas('evaluationType', function ($typeQuery) use ($search): void {
                        $typeQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (in_array($status, ['scheduled', 'completed'], true)) {
            $query->where('status', $status);
        }

        if ($classId !== '') {
            $query->where('class_id', $classId);
        }

        if ($evaluationTypeId !== '') {
            $query->where('evaluation_type_id', $evaluationTypeId);
        }

        $evaluations = $query
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->appends($request->query());

        $today = Carbon::today();
        $weekEnd = Carbon::today()->addDays(7)->endOfDay();
        $globalStatsQuery = Evaluation::query();
        $total = (clone $globalStatsQuery)->count();
        $scheduledCount = (clone $globalStatsQuery)->where('status', 'scheduled')->count();
        $completedCount = (clone $globalStatsQuery)->where('status', 'completed')->count();
        $overdueCount = (clone $globalStatsQuery)
            ->where('status', 'scheduled')
            ->whereNotNull('date')
            ->whereDate('date', '<', $today)
            ->count();
        $upcomingWeekCount = (clone $globalStatsQuery)
            ->where('status', 'scheduled')
            ->whereBetween('date', [$today, $weekEnd])
            ->count();
        $classCoverage = (clone $globalStatsQuery)
            ->whereNotNull('class_id')
            ->distinct('class_id')
            ->count('class_id');
        $completionRate = $total > 0 ? round(($completedCount / $total) * 100, 1) : 0;

        return Inertia::render('Administration/Evaluations/Index', [
            'evaluations' => $evaluations,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'class_id' => $classId,
                'evaluation_type_id' => $evaluationTypeId,
            ],
            'classrooms' => Classroom::where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'evaluationTypes' => EvaluationType::orderBy('name')->get(['id', 'name']),
            'stats' => [
                'total' => $total,
                'scheduled' => $scheduledCount,
                'completed' => $completedCount,
                'overdue' => $overdueCount,
                'upcoming_week' => $upcomingWeekCount,
                'class_coverage' => $classCoverage,
                'completion_rate' => $completionRate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $evaluationTypes = EvaluationType::orderBy('name')->get(['id', 'name']);
        $classrooms = Classroom::where('active', true)->orderBy('name')->get(['id', 'name', 'code']);

        $activeYear = AcademicYear::where('active', true)->first(['id']);
        $academicPeriods = AcademicPeriod::orderByDesc('start_date')->get(['id', 'name', 'is_current', 'academic_year_id']);

        $currentPeriod = $activeYear
            ? $academicPeriods->where('academic_year_id', $activeYear->id)->where('is_current', true)->first()
            : $academicPeriods->where('is_current', true)->first();

        if (! $currentPeriod && $activeYear) {
            $currentPeriod = $academicPeriods->where('academic_year_id', $activeYear->id)->first();
        }

        return Inertia::render('Administration/Evaluations/Create', [
            'evaluationTypes' => $evaluationTypes,
            'classrooms' => $classrooms,
            'academicPeriods' => $academicPeriods->values(),
            'currentAcademicPeriodId' => $currentPeriod?->id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'academic_period_id' => ['required', 'uuid', 'exists:academic_periods,id'],
            'evaluations' => ['required', 'array', 'min:1'],
            'evaluations.*.evaluation_type_id' => ['required', 'uuid', 'exists:evaluation_types,id'],
            'evaluations.*.name' => ['required', 'string', 'max:255'],
            'evaluations.*.description' => ['nullable', 'string'],
            'evaluations.*.date' => ['nullable', 'date'],
            'evaluations.*.coefficient' => ['required', 'numeric', 'gt:0', 'max:999.99'],
            'evaluations.*.status' => ['required', 'in:scheduled,completed'],
        ], [
            'class_id.required' => 'La classe est obligatoire.',
            'academic_period_id.required' => 'La période académique est obligatoire.',
            'evaluations.required' => 'Ajoutez au moins une évaluation.',
            'evaluations.min' => 'Ajoutez au moins une évaluation.',
            'evaluations.*.name.required' => self::MSG_EVALUATION_NAME_REQUIRED,
            'evaluations.*.evaluation_type_id.required' => self::MSG_EVALUATION_TYPE_REQUIRED,
            'evaluations.*.coefficient.gt' => self::MSG_COEFFICIENT_GT_ZERO,
        ]);

        DB::transaction(function () use ($validated): void {
            foreach ($validated['evaluations'] as $evaluation) {
                Evaluation::create([
                    'class_id' => $validated['class_id'],
                    'academic_period_id' => $validated['academic_period_id'],
                    'evaluation_type_id' => $evaluation['evaluation_type_id'],
                    'name' => $evaluation['name'],
                    'description' => $evaluation['description'] ?? null,
                    'date' => $evaluation['date'] ?? null,
                    'coefficient' => $evaluation['coefficient'],
                    'status' => $evaluation['status'],
                ]);
            }
        });

        return redirect()
            ->route('evaluations.index')
            ->with('message', 'Évaluations créées avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Evaluation $evaluation): Response
    {
        $evaluation->load([
            'evaluationType:id,name',
            'classroom:id,name,code',
            'academicPeriod:id,name',
        ]);

        return Inertia::render('Administration/Evaluations/Show', [
            'evaluation' => $evaluation,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Evaluation $evaluation): Response
    {
        $evaluation->load([
            'evaluationType:id,name',
            'classroom:id,name,code',
            'academicPeriod:id,name',
        ]);

        $evaluationTypes = EvaluationType::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Administration/Evaluations/Edit', [
            'evaluation' => $evaluation,
            'evaluationTypes' => $evaluationTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Evaluation $evaluation)
    {
        $validated = $request->validate([
            'evaluation_type_id' => ['required', 'uuid', 'exists:evaluation_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['nullable', 'date'],
            'coefficient' => ['required', 'numeric', 'gt:0', 'max:999.99'],
            'status' => ['required', 'in:scheduled,completed'],
        ], [
            'name.required' => self::MSG_EVALUATION_NAME_REQUIRED,
            'evaluation_type_id.required' => self::MSG_EVALUATION_TYPE_REQUIRED,
            'coefficient.gt' => self::MSG_COEFFICIENT_GT_ZERO,
        ]);

        $evaluation->update($validated);

        return redirect()
            ->route('evaluations.index')
            ->with('message', 'Évaluation mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();

        return redirect()
            ->route('evaluations.index')
            ->with('message', 'Évaluation supprimée avec succès.');
    }

    /**
     * Show form for bulk scheduling.
     */
    public function bulkScheduleForm(): Response
    {
        $evaluationTypes = EvaluationType::orderBy('name')->get(['id', 'name']);
        $classrooms = Classroom::where('active', true)->orderBy('name')->get(['id', 'name', 'code', 'classroom_type_id']);
        $classroomTypes = \App\Models\ClassroomType::orderBy('name')->get(['id', 'name']);
        $academicPeriods = AcademicPeriod::orderByDesc('start_date')->get(['id', 'name']);

        return Inertia::render('Administration/Evaluations/BulkSchedule', [
            'evaluationTypes' => $evaluationTypes,
            'classrooms' => $classrooms,
            'classroomTypes' => $classroomTypes,
            'academicPeriods' => $academicPeriods,
        ]);
    }

    /**
     * Store bulk scheduled evaluations.
     */
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'classroom_ids' => ['required_without:classroom_type_id', 'array'],
            'classroom_ids.*' => ['uuid', 'exists:classes,id'],
            'classroom_type_id' => ['required_without:classroom_ids', 'nullable', 'uuid', 'exists:classroom_types,id'],
            'academic_period_id' => ['required', 'uuid', 'exists:academic_periods,id'],
            'evaluation_type_id' => ['required', 'uuid', 'exists:evaluation_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['nullable', 'date'],
            'coefficient' => ['required', 'numeric', 'gt:0', 'max:999.99'],
            'status' => ['required', 'in:scheduled,completed'],
        ], [
            'name.required' => self::MSG_EVALUATION_NAME_REQUIRED,
            'academic_period_id.required' => 'La période académique est obligatoire.',
            'evaluation_type_id.required' => self::MSG_EVALUATION_TYPE_REQUIRED,
            'coefficient.gt' => self::MSG_COEFFICIENT_GT_ZERO,
        ]);

        // Determine which classrooms to use
        $classroomIds = $validated['classroom_ids'] ?? [];
        
        if ($validated['classroom_type_id']) {
            $classroomIds = Classroom::where('active', true)
                ->where('classroom_type_id', $validated['classroom_type_id'])
                ->pluck('id')
                ->toArray();
        }

        if (empty($classroomIds)) {
            return back()->withErrors(['classrooms' => 'Aucune classe sélectionnée.']);
        }

        DB::transaction(function () use ($classroomIds, $validated): void {
            foreach ($classroomIds as $classId) {
                Evaluation::create([
                    'class_id' => $classId,
                    'academic_period_id' => $validated['academic_period_id'],
                    'evaluation_type_id' => $validated['evaluation_type_id'],
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                    'date' => $validated['date'] ?? null,
                    'coefficient' => $validated['coefficient'],
                    'status' => $validated['status'],
                ]);
            }
        });

        return redirect()
            ->route('evaluations.index')
            ->with('message', count($classroomIds) . ' évaluations créées avec succès.');
    }
}
