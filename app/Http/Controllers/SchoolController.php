<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Requests\UpdateSchoolRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = School::query();
        $activeSchoolsCount = School::where('active', true)->count();

        // Recherche par nom, code ou email
        if (request('search')) {
            $search = request('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
        }

        if (request()->filled('active')) {
            $activeFilter = request('active');

            if ($activeFilter === '1') {
                $query->where('active', true);
            } elseif ($activeFilter === '0') {
                $query->where('active', false);
            }
        }

        $schools = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
            'activeSchoolsCount' => $activeSchoolsCount,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Schools/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSchoolRequest $request)
    {
        School::create($request->validated());

        return redirect()->route('schools.index')
            ->with('message', 'École créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(School $school)
    {
        return Inertia::render('Schools/Show', [
            'school' => $school,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(School $school)
    {
        return Inertia::render('Schools/Edit', [
            'school' => $school,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSchoolRequest $request, School $school)
    {
        $school->update($request->validated());

        return redirect()->route('schools.index')
            ->with('message', 'École mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(School $school)
    {
        $school->delete();

        return redirect()->route('schools.index')
            ->with('message', 'École supprimée avec succès.');
    }

    /**
     * Disable multiple schools in one action.
     */
    public function bulkDeactivate(Request $request)
    {
        $validated = $request->validate([
            'school_ids' => ['required', 'array', 'min:1'],
            'school_ids.*' => ['required', 'uuid', 'exists:schools,id'],
        ]);

        $updatedCount = School::whereIn('id', $validated['school_ids'])
            ->where('active', true)
            ->update(['active' => false]);

        return redirect()->route('schools.index')
            ->with('message', "{$updatedCount} école(s) désactivée(s) avec succès.");
    }

    /**
     * Enable multiple schools in one action.
     */
    public function bulkActivate(Request $request)
    {
        $validated = $request->validate([
            'school_ids' => ['required', 'array', 'min:1'],
            'school_ids.*' => ['required', 'uuid', 'exists:schools,id'],
        ]);

        $updatedCount = School::whereIn('id', $validated['school_ids'])
            ->where('active', false)
            ->update(['active' => true]);

        return redirect()->route('schools.index')
            ->with('message', "{$updatedCount} école(s) activée(s) avec succès.");
    }

    /**
     * Toggle school active status quickly from index.
     */
    public function toggleActive(School $school)
    {
        $school->update(['active' => ! $school->active]);

        $status = $school->active ? 'activée' : 'désactivée';

        return redirect()->route('schools.index')
            ->with('message', "École {$status} avec succès.");
    }
}
