<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationController extends Controller
{
    /**
     * Liste toutes les évaluations (classe/matière) avec filtres.
     */
    public function index(Request $request): Response
    {
        $search     = $request->string('search')->toString();
        $status     = $request->string('status')->toString();
        $periodId   = $request->string('period_id')->toString();
        $templateId = $request->string('template_id')->toString();

        $query = Evaluation::query()
            ->with([
                'template:id,name,coefficient,max_score,academic_period_id,evaluation_type_id',
                'template.academicPeriod:id,name',
                'template.evaluationType:id,name',
                'classSubject:id,class_id,subject_id',
                'classSubject.class:id,name,code',
                'classSubject.subject:id,name',
            ])
            ->withCount(['marks', 'marks as graded_count' => fn ($q) => $q->whereNotNull('score')->where('absent', false)])
            ->when($status && in_array($status, ['scheduled', 'completed'], true), fn ($q) => $q->where('status', $status))
            ->when($templateId, fn ($q) => $q->where('evaluation_template_id', $templateId))
            ->when($periodId, fn ($q) => $q->whereHas('template', fn ($tq) => $tq->where('academic_period_id', $periodId)))
            ->when($search, fn ($q) => $q->whereHas('template', fn ($tq) => $tq->where('name', 'like', "%{$search}%"))
                ->orWhereHas('classSubject.class', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                ->orWhereHas('classSubject.subject', fn ($sq) => $sq->where('name', 'like', "%{$search}%")));

        $evaluations = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
            'filters'     => compact('search', 'status', 'periodId', 'templateId'),
        ]);
    }

    /**
     * Détail d'une évaluation.
     */
    public function show(Evaluation $evaluation): Response
    {
        $evaluation->load([
            'template:id,name,coefficient,max_score,date,academic_period_id,evaluation_type_id',
            'template.academicPeriod:id,name',
            'template.evaluationType:id,name',
            'classSubject:id,class_id,subject_id,coefficient',
            'classSubject.class:id,name,code',
            'classSubject.subject:id,name',
            'marks.student:id,firstname,lastname,matricule',
        ]);

        return Inertia::render('Evaluations/Show', [
            'evaluation' => $evaluation,
        ]);
    }

    /**
     * Change le statut scheduled ↔ completed.
     */
    public function updateStatus(Request $request, Evaluation $evaluation)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:scheduled,completed'],
        ]);

        $evaluation->update($validated);

        return back()->with('message', 'Statut mis à jour.');
    }

    /**
     * Supprime une évaluation (et toutes ses notes par cascade).
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();

        return back()->with('message', 'Évaluation supprimée.');
    }
}
