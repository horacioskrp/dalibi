<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Classroom;
use App\Models\ClassSubject;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\GradingConfig;
use Illuminate\Support\Collection;

/**
 * Source unique de calcul des moyennes, rangs et mentions.
 *
 * Phase 1 : s'appuie sur la note consolidée de période ({@see Grade}), source actuelle du bulletin.
 * Phase 2 : la note matière sera dérivée du couple Classe/Composition selon la configuration.
 */
class GradingService
{
    public function round(?float $value, GradingConfig $config): ?float
    {
        return $value === null ? null : round($value, $config->round_precision);
    }

    /** Note d'une matière pour un élève sur une période (note consolidée). */
    public function subjectScore(string $classSubjectId, string $studentId, string $periodId): ?float
    {
        $score = Grade::where('class_subject_id', $classSubjectId)
            ->where('student_id', $studentId)
            ->where('academic_period_id', $periodId)
            ->value('score');

        return $score !== null ? (float) $score : null;
    }

    /**
     * Moyenne générale de période, pondérée par le coefficient des matières.
     *
     * @param  Collection<int, ClassSubject>  $classSubjects
     * @return array{average: float|null, total_points: float, total_coeff: float}
     */
    public function periodAverage(string $studentId, string $periodId, Collection $classSubjects, GradingConfig $config): array
    {
        $scores = Grade::whereIn('class_subject_id', $classSubjects->pluck('id'))
            ->where('student_id', $studentId)
            ->where('academic_period_id', $periodId)
            ->whereNotNull('score')
            ->pluck('score', 'class_subject_id');

        return $this->weightedAverage($scores, $classSubjects->pluck('coefficient', 'id'), $config);
    }

    /**
     * Classement de période d'une classe (compétition standard, ex æquo gérés).
     *
     * @return Collection<string, array{average: float|null, rank: int|null}>
     */
    public function classRanking(Classroom $class, string $periodId, GradingConfig $config): Collection
    {
        $classSubjects = $class->classSubjects()->get(['id', 'coefficient']);
        $coeffs        = $classSubjects->pluck('coefficient', 'id');

        $studentIds = $this->activeStudentIds($class->id);

        // Toutes les notes de la période pour ces matières, en une requête.
        $byStudent = Grade::whereIn('class_subject_id', $classSubjects->pluck('id'))
            ->where('academic_period_id', $periodId)
            ->whereNotNull('score')
            ->get(['student_id', 'class_subject_id', 'score'])
            ->groupBy('student_id');

        $rows = $studentIds->map(function ($studentId) use ($byStudent, $coeffs, $config) {
            $scores = $byStudent->get($studentId, collect())->pluck('score', 'class_subject_id');

            return [
                'student_id' => $studentId,
                'average'    => $this->weightedAverage($scores, $coeffs, $config)['average'],
            ];
        });

        return $this->assignRanks($rows);
    }

    /**
     * Classement d'une matière sur une période.
     *
     * @return Collection<string, array{average: float|null, rank: int|null}>
     */
    public function subjectRanking(ClassSubject $classSubject, string $periodId, GradingConfig $config): Collection
    {
        $studentIds = $this->activeStudentIds($classSubject->class_id);

        $scores = Grade::where('class_subject_id', $classSubject->id)
            ->where('academic_period_id', $periodId)
            ->whereNotNull('score')
            ->pluck('score', 'student_id');

        $rows = $studentIds->map(fn ($studentId) => [
            'student_id' => $studentId,
            'average'    => isset($scores[$studentId]) ? $this->round((float) $scores[$studentId], $config) : null,
        ]);

        return $this->assignRanks($rows);
    }

    /**
     * Moyenne annuelle pondérée par le poids des périodes (2 ou 3 selon le type de classe).
     *
     * @param  Collection<int, AcademicPeriod>  $periods
     * @param  Collection<int, ClassSubject>    $classSubjects
     */
    public function annualAverage(string $studentId, Collection $periods, Collection $classSubjects, GradingConfig $config): ?float
    {
        $totalWeight = 0.0;
        $weighted    = 0.0;
        $hasAny      = false;

        foreach ($periods as $period) {
            $avg = $this->periodAverage($studentId, $period->id, $classSubjects, $config)['average'];
            if ($avg === null) {
                continue;
            }
            $weight       = (float) ($period->weight ?? 1);
            $totalWeight += $weight;
            $weighted    += $avg * $weight;
            $hasAny       = true;
        }

        return ($hasAny && $totalWeight > 0) ? $this->round($weighted / $totalWeight, $config) : null;
    }

    public function mention(?float $average, GradingConfig $config): ?string
    {
        return $config->mentionFor($average);
    }

    /**
     * @param  Collection<string, mixed>  $scores  note indexée par class_subject_id
     * @param  Collection<string, mixed>  $coeffs  coefficient indexé par class_subject_id
     * @return array{average: float|null, total_points: float, total_coeff: float}
     */
    private function weightedAverage(Collection $scores, Collection $coeffs, GradingConfig $config): array
    {
        $totalCoeff = 0.0;
        $weighted   = 0.0;

        foreach ($scores as $classSubjectId => $score) {
            if ($score === null) {
                continue;
            }
            $coeff       = (float) ($coeffs[$classSubjectId] ?? 1);
            $totalCoeff += $coeff;
            $weighted   += (float) $score * $coeff;
        }

        return [
            'average'      => $totalCoeff > 0 ? $this->round($weighted / $totalCoeff, $config) : null,
            'total_points' => round($weighted, $config->round_precision),
            'total_coeff'  => $totalCoeff,
        ];
    }

    /** @return Collection<int, string> */
    private function activeStudentIds(string $classId): Collection
    {
        return Enrollment::where('class_id', $classId)
            ->where('status', 'active')
            ->pluck('student_id');
    }

    /**
     * Attribue les rangs (1, 1, 3…). Les élèves sans moyenne ne sont pas classés (rang null).
     *
     * @param  Collection<int, array{student_id: mixed, average: float|null}>  $rows
     * @return Collection<string, array{average: float|null, rank: int|null}>
     */
    private function assignRanks(Collection $rows): Collection
    {
        $sorted = $rows->sortByDesc(fn ($r) => $r['average'] ?? -1)->values();
        $result = collect();

        $rank     = 0;
        $position = 0;
        $lastAvg  = null;

        foreach ($sorted as $row) {
            $position++;

            if ($row['average'] === null) {
                $result[$row['student_id']] = ['average' => null, 'rank' => null];
                continue;
            }

            if ($lastAvg === null || $row['average'] < $lastAvg) {
                $rank    = $position;
                $lastAvg = $row['average'];
            }

            $result[$row['student_id']] = ['average' => $row['average'], 'rank' => $rank];
        }

        return $result;
    }
}
