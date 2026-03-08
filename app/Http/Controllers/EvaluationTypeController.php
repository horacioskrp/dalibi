<?php

namespace App\Http\Controllers;

use App\Models\EvaluationType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $query = EvaluationType::query();

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $evaluationTypes = $query
            ->orderBy('name')
            ->paginate(10)
            ->appends($request->query());

        return Inertia::render('Administration/EvaluationTypes/Index', [
            'evaluationTypes' => $evaluationTypes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Administration/EvaluationTypes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:evaluation_types,name'],
            'description' => ['nullable', 'string'],
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'name.unique' => 'Ce type d\'évaluation existe déjà.',
        ]);

        EvaluationType::create($validated);

        return redirect()
            ->route('evaluation-types.index')
            ->with('message', 'Type d\'évaluation créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EvaluationType $evaluationType): Response
    {
        return Inertia::render('Administration/EvaluationTypes/Show', [
            'evaluationType' => $evaluationType,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EvaluationType $evaluationType): Response
    {
        return Inertia::render('Administration/EvaluationTypes/Edit', [
            'evaluationType' => $evaluationType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EvaluationType $evaluationType)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:evaluation_types,name,' . $evaluationType->id],
            'description' => ['nullable', 'string'],
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'name.unique' => 'Ce type d\'évaluation existe déjà.',
        ]);

        $evaluationType->update($validated);

        return redirect()
            ->route('evaluation-types.index')
            ->with('message', 'Type d\'évaluation mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationType $evaluationType)
    {
        $evaluationType->delete();

        return redirect()
            ->route('evaluation-types.index')
            ->with('message', 'Type d\'évaluation supprimé avec succès.');
    }
}
