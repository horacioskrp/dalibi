<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeeStructureRequest;
use App\Http\Requests\UpdateFeeStructureRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\FeeCategorie;
use App\Models\FeeStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeStructureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FeeStructure::with(['academicYear', 'feeCategory', 'classroom'])
            ->orderBy('created_at', 'desc');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('feeCategory', function ($query) use ($search) {
                    $query->where('name', 'ilike', "%{$search}%");
                })
                ->orWhereHas('classroom', function ($query) use ($search) {
                    $query->where('name', 'ilike', "%{$search}%")
                          ->orWhere('code', 'ilike', "%{$search}%");
                })
                ->orWhereHas('academicYear', function ($query) use ($search) {
                    $query->where('year', 'ilike', "%{$search}%");
                });
            });
        }

        $feeStructures = $query->paginate(10)->withQueryString();

        return Inertia::render('FeeStructures/Index', [
            'feeStructures' => $feeStructures,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('FeeStructures/Create', [
            'academicYears' => AcademicYear::orderBy('year', 'desc')->get(),
            'feeCategories' => FeeCategorie::orderBy('name')->get(),
            'classrooms' => Classroom::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFeeStructureRequest $request)
    {
        $feeStructure = FeeStructure::create($request->validated());

        return redirect()->route('fee-structures.show', $feeStructure)
            ->with('message', 'Structure de frais créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FeeStructure $feeStructure)
    {
        $feeStructure->load(['academicYear', 'feeCategory', 'classroom']);

        return Inertia::render('FeeStructures/Show', [
            'feeStructure' => $feeStructure,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FeeStructure $feeStructure)
    {
        $feeStructure->load(['academicYear', 'feeCategory', 'classroom']);

        return Inertia::render('FeeStructures/Edit', [
            'feeStructure' => $feeStructure,
            'academicYears' => AcademicYear::orderBy('year', 'desc')->get(),
            'feeCategories' => FeeCategorie::orderBy('name')->get(),
            'classrooms' => Classroom::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFeeStructureRequest $request, FeeStructure $feeStructure)
    {
        $feeStructure->update($request->validated());

        return redirect()->route('fee-structures.index')
            ->with('message', 'Structure de frais mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FeeStructure $feeStructure)
    {
        $feeStructure->delete();

        return redirect()->route('fee-structures.index')
            ->with('message', 'Structure de frais supprimée avec succès.');
    }
}
