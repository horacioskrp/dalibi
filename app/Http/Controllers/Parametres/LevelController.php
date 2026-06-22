<?php

namespace App\Http\Controllers\Parametres;
use App\Http\Controllers\Controller;

use App\Http\Requests\StoreLevelRequest;
use App\Http\Requests\UpdateLevelRequest;
use App\Models\Level;
use Inertia\Inertia;

class LevelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Level::query();
        $search = request('search');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $levels = $query->orderBy('name')->paginate(10)->appends(request()->query());

        return Inertia::render('Parametres/Levels/Index', [
            'levels' => $levels,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Parametres/Levels/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLevelRequest $request)
    {
        Level::create($request->validated());

        return redirect()->route('levels.index')
            ->with('message', 'Niveau créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Level $level)
    {
        return Inertia::render('Parametres/Levels/Show', [
            'level' => $level,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Level $level)
    {
        return Inertia::render('Parametres/Levels/Edit', [
            'level' => $level,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLevelRequest $request, Level $level)
    {
        $level->update($request->validated());

        return redirect()->route('levels.index')
            ->with('message', 'Niveau mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Level $level)
    {
        $level->delete();

        return redirect()->route('levels.index')
            ->with('message', 'Niveau supprimé avec succès.');
    }
}
