<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentStatsController extends Controller
{
    public function index(\Illuminate\Http\Request $request): Response
    {
        abort_unless(
            $request->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::SECRETARIAT]),
            403
        );

        $total    = Student::count();
        $active   = Student::where('active', true)->count();

        // Répartition par sexe
        $byGender = [
            'male'   => Student::where('gender', 'male')->count(),
            'female' => Student::where('gender', 'female')->count(),
        ];

        // Répartition par nationalité (top 6)
        $byNationality = Student::query()
            ->select('nationality', DB::raw('COUNT(*) as count'))
            ->whereNotNull('nationality')
            ->where('nationality', '!=', '')
            ->groupBy('nationality')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn ($r) => ['label' => $r->nationality, 'count' => (int) $r->count]);

        // Répartition par tranche d'âge
        $brackets = [
            'Moins de 6 ans' => 0,
            '6 à 10 ans'     => 0,
            '11 à 14 ans'    => 0,
            '15 à 18 ans'    => 0,
            'Plus de 18 ans' => 0,
        ];
        foreach (Student::whereNotNull('birth_date')->pluck('birth_date') as $dob) {
            $age = Carbon::parse($dob)->age;
            $key = match (true) {
                $age < 6  => 'Moins de 6 ans',
                $age <= 10 => '6 à 10 ans',
                $age <= 14 => '11 à 14 ans',
                $age <= 18 => '15 à 18 ans',
                default    => 'Plus de 18 ans',
            };
            $brackets[$key]++;
        }
        $byAge = collect($brackets)->map(fn ($count, $label) => ['label' => $label, 'count' => $count])->values();

        // Effectifs par classe (année active, scolarité active)
        $activeYear = AcademicYear::where('active', true)->first(['id', 'year']);
        $byClass = collect();
        $enrolledActive = 0;
        if ($activeYear) {
            $byClass = Enrollment::query()
                ->join('classes', 'classes.id', '=', 'enrollments.class_id')
                ->where('enrollments.academic_year_id', $activeYear->id)
                ->whereIn('enrollments.academic_status', Enrollment::ACTIVE_ACADEMIC_STATUSES)
                ->select('classes.name as label', DB::raw('COUNT(*) as count'))
                ->groupBy('classes.name')
                ->orderBy('classes.name')
                ->get()
                ->map(fn ($r) => ['label' => $r->label, 'count' => (int) $r->count]);

            $enrolledActive = (int) $byClass->sum('count');
        }

        return Inertia::render('Students/Stats', [
            'summary' => [
                'total'           => $total,
                'active'          => $active,
                'inactive'        => $total - $active,
                'enrolled_active' => $enrolledActive,
            ],
            'byGender'      => $byGender,
            'byNationality' => $byNationality,
            'byAge'         => $byAge,
            'byClass'       => $byClass,
            'activeYear'    => $activeYear,
        ]);
    }
}
