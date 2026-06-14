<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Models\Evaluation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationController extends Controller
{
    public function index(Request $request): Response
    {
        $search     = $request->string('search')->toString();
        $status     = $request->string('status')->toString();
        $periodId   = $request->string('period_id')->toString();
        $templateId = $request->string('template_id')->toString();
        $user       = $request->user();

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
            ->when($search, function ($q) use ($search): void {
                $like = ['%'.strtolower($search).'%'];
                $expr = 'LOWER(name) LIKE ?';
                $q->whereHas('template', fn ($tq) => $tq->whereRaw($expr, $like))
                  ->orWhereHas('classSubject.class', fn ($cq) => $cq->whereRaw($expr, $like))
                  ->orWhereHas('classSubject.subject', fn ($sq) => $sq->whereRaw($expr, $like));
            });

        $evaluations = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
            'filters'     => compact('search', 'status', 'periodId', 'templateId'),
            'canLock'     => $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]),
        ]);
    }

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

    public function updateStatus(Request $request, Evaluation $evaluation): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::TEACHER]), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:scheduled,completed'],
        ]);

        $evaluation->update($validated);

        return back()->with('message', 'Statut mis à jour.');
    }

    public function toggleLock(Request $request, Evaluation $evaluation): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]), 403);

        $isLocked = $evaluation->locked_at !== null;

        $evaluation->update([
            'locked_at' => $isLocked ? null : now(),
            'locked_by' => $isLocked ? null : $request->user()->id,
        ]);

        $msg = $isLocked ? 'Évaluation déclôturée.' : 'Évaluation clôturée.';

        return back()->with('message', $msg);
    }

    public function destroy(Request $request, Evaluation $evaluation): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]), 403);

        $evaluation->delete();

        return back()->with('message', 'Évaluation supprimée.');
    }
}
