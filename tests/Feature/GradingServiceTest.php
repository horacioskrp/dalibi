<?php

namespace Tests\Feature;

use App\Models\AcademicPeriod;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\ClassroomType;
use App\Models\ClassSubject;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\GradingConfig;
use App\Models\School;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use App\Services\GradingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GradingServiceTest extends TestCase
{
    use RefreshDatabase;

    private GradingService $service;
    private School $school;
    private AcademicYear $year;
    private ClassroomType $type;
    private Classroom $class;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(GradingService::class);
        $this->school = School::factory()->create();
        $this->year   = AcademicYear::create([
            'year' => '2025-2026', 'start_date' => '2025-09-01', 'end_date' => '2026-07-31', 'active' => true,
        ]);
        $this->type  = ClassroomType::factory()->create(['period_system' => 'trimestre']);
        $this->class = Classroom::factory()->create(['classroom_type_id' => $this->type->id]);
    }

    private function config(?ClassroomType $type = null, bool $active = true, string $name = 'Test'): GradingConfig
    {
        return GradingConfig::create([
            'school_id'         => $this->school->id,
            'classroom_type_id' => $type?->id,
            'name'              => $name,
            'is_active'         => $active,
            'passing_score'     => 10,
            'default_max_score' => 20,
            'class_weight'      => 1,
            'comp_weight'       => 1,
            'round_precision'   => 2,
            'mentions'          => GradingConfig::defaultMentions(),
        ]);
    }

    private function subject(string $name, float $coeff): ClassSubject
    {
        $subject = Subject::create(['name' => $name, 'code' => strtoupper(Str::random(5))]);

        return ClassSubject::create([
            'class_id'         => $this->class->id,
            'subject_id'       => $subject->id,
            'coefficient'      => $coeff,
            'academic_year_id' => $this->year->id,
        ]);
    }

    private function student(): Student
    {
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id, 'matricule' => 'M' . Str::random(6),
            'firstname' => 'P', 'lastname' => Str::random(5), 'gender' => 'male', 'birth_date' => '2010-01-01',
        ]);

        Enrollment::create([
            'school_id' => $this->school->id, 'student_id' => $student->id, 'class_id' => $this->class->id,
            'academic_year_id' => $this->year->id, 'enrollment_code' => 'E' . Str::random(8),
            'enrollment_date' => now(), 'status' => 'active',
        ]);

        return $student;
    }

    private function period(string $name, int $order, float $weight, bool $current = false): AcademicPeriod
    {
        return AcademicPeriod::create([
            'name' => $name, 'start_date' => '2025-09-01', 'end_date' => '2025-12-31',
            'type' => 'trimestre', 'order' => $order, 'weight' => $weight, 'is_current' => $current,
            'academic_year_id' => $this->year->id, 'class_type_id' => $this->type->id,
        ]);
    }

    private function grade(Student $s, ClassSubject $cs, AcademicPeriod $p, float $score): void
    {
        Grade::create([
            'student_id' => $s->id, 'class_subject_id' => $cs->id,
            'academic_period_id' => $p->id, 'score' => $score,
        ]);
    }

    public function test_mention_thresholds(): void
    {
        $config = $this->config();

        $this->assertSame("Tableau d'honneur", $config->mentionFor(18.5));
        $this->assertSame('Félicitations', $config->mentionFor(16));
        $this->assertSame('Encouragements', $config->mentionFor(15));
        $this->assertSame('Passable', $config->mentionFor(10));
        $this->assertNull($config->mentionFor(9.5));
    }

    public function test_resolve_prefers_class_type_over_school_default(): void
    {
        $default = $this->config(null, true, 'Défaut école');
        $typed   = $this->config($this->type, true, 'Type spécifique');

        $this->assertSame($typed->id, GradingConfig::resolveFor($this->school, $this->type)?->id);
        $this->assertSame($default->id, GradingConfig::resolveFor($this->school, null)?->id);
    }

    public function test_period_average_and_class_ranking_with_ties(): void
    {
        $config = $this->config($this->type);
        $math = $this->subject('Maths', 2);
        $fr   = $this->subject('Français', 1);
        $p1   = $this->period('Trimestre 1', 1, 1, true);

        $a = $this->student();
        $b = $this->student();
        $c = $this->student();

        // A : (16*2 + 10)/3 = 14 ; B : (10*2 + 16)/3 = 12 ; C : (14*2 + 14)/3 = 14
        $this->grade($a, $math, $p1, 16); $this->grade($a, $fr, $p1, 10);
        $this->grade($b, $math, $p1, 10); $this->grade($b, $fr, $p1, 16);
        $this->grade($c, $math, $p1, 14); $this->grade($c, $fr, $p1, 14);

        $classSubjects = $this->class->classSubjects()->get();

        $this->assertSame(14.0, $this->service->periodAverage($a->id, $p1->id, $classSubjects, $config)['average']);
        $this->assertSame(12.0, $this->service->periodAverage($b->id, $p1->id, $classSubjects, $config)['average']);

        $ranking = $this->service->classRanking($this->class, $p1->id, $config);
        $this->assertSame(1, $ranking[$a->id]['rank']);
        $this->assertSame(1, $ranking[$c->id]['rank']); // ex æquo avec A
        $this->assertSame(3, $ranking[$b->id]['rank']);

        $mathRank = $this->service->subjectRanking($math, $p1->id, $config);
        $this->assertSame(1, $mathRank[$a->id]['rank']); // 16
        $this->assertSame(2, $mathRank[$c->id]['rank']); // 14
        $this->assertSame(3, $mathRank[$b->id]['rank']); // 10
    }

    public function test_annual_average_weighted_by_period_weight(): void
    {
        $config = $this->config($this->type);
        $math = $this->subject('Maths', 2);
        $fr   = $this->subject('Français', 1);
        $p1 = $this->period('Trimestre 1', 1, 1);
        $p2 = $this->period('Trimestre 2', 2, 2);

        $a = $this->student();
        // P1 = 14 ; P2 = (18*2 + 15)/3 = 17 ; annuelle = (14*1 + 17*2)/3 = 16
        $this->grade($a, $math, $p1, 16); $this->grade($a, $fr, $p1, 10);
        $this->grade($a, $math, $p2, 18); $this->grade($a, $fr, $p2, 15);

        $classSubjects = $this->class->classSubjects()->get();
        $annual = $this->service->annualAverage($a->id, collect([$p1, $p2]), $classSubjects, $config);

        $this->assertSame(16.0, $annual);
    }
}
