<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSchoolingRequest;
use App\Http\Requests\UpdateSchoolingRequest;
use App\Models\Classroom;
use App\Models\Schooling;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Schooling::with('classroom');

        if ($request->filled('search')) {
            $searchTerm = strtolower($request->string('search')->toString());
            $query->whereHas('classroom', function ($classroomQuery) use ($searchTerm): void {
                $classroomQuery->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                    ->orWhereRaw('LOWER(code) LIKE ?', ["%{$searchTerm}%"]);
            });
        }

        $schoolings = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $totals = [
            'count' => Schooling::count(),
            'inscription_fee' => (float) Schooling::sum('inscription_fee'),
            'school_fee' => (float) Schooling::sum('school_fee'),
        ];

        return Inertia::render('Administration/Schoolings/Index', [
            'schoolings' => $schoolings,
            'filters' => $request->only(['search']),
            'totals' => $totals,
        ]);
    }

    public function create(): Response
    {
        $classrooms = Classroom::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Administration/Schoolings/Create', [
            'classrooms' => $classrooms,
        ]);
    }

    public function store(StoreSchoolingRequest $request)
    {
        Schooling::create($request->validated());

        return redirect()->route('schoolings.index')
            ->with('success', 'Ecolage créé avec succès.');
    }

    public function show(Schooling $schooling): Response
    {
        $schooling->load('classroom');

        return Inertia::render('Administration/Schoolings/Show', [
            'schooling' => $schooling,
        ]);
    }

    public function edit(Schooling $schooling): Response
    {
        $schooling->load('classroom');

        $classrooms = Classroom::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Administration/Schoolings/Edit', [
            'schooling' => $schooling,
            'classrooms' => $classrooms,
        ]);
    }

    public function update(UpdateSchoolingRequest $request, Schooling $schooling)
    {
        $schooling->update($request->validated());

        return redirect()->route('schoolings.index')
            ->with('success', 'Ecolage mis à jour avec succès.');
    }

    public function destroy(Schooling $schooling)
    {
        $schooling->delete();

        return redirect()->route('schoolings.index')
            ->with('success', 'Ecolage supprimé avec succès.');
    }
}
