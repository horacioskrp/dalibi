<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\AcademicPeriod;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\ClassroomType;
use App\Models\ClassSubject;
use App\Models\Enrollment;
use App\Models\Evaluation;
use App\Models\EvaluationTemplate;
use App\Models\EvaluationType;
use App\Models\GradingConfig;
use App\Models\Mark;
use App\Models\ReportCard;
use App\Models\School;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BulletinTest extends TestCase
{
    use RefreshDatabase;

    private School $school;
    private AcademicYear $year;
    private ClassroomType $type;
    private Classroom $class;
    private AcademicPeriod $period;
    private ClassSubject $cs;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->school = School::factory()->create();
        $this->year   = AcademicYear::create(['year' => '2025-2026', 'start_date' => '2025-09-01', 'end_date' => '2026-07-31', 'active' => true]);
        $this->type   = ClassroomType::factory()->create(['period_system' => 'trimestre']);
        $this->class  = Classroom::factory()->create(['classroom_type_id' => $this->type->id]);
        $this->period = AcademicPeriod::create([
            'name' => 'Trimestre 1', 'start_date' => '2025-09-01', 'end_date' => '2025-12-31',
            'type' => 'trimestre', 'order' => 1, 'weight' => 1, 'is_current' => true,
            'academic_year_id' => $this->year->id, 'class_type_id' => $this->type->id,
        ]);

        $subject = Subject::create(['name' => 'Maths', 'code' => 'MATH']);
        $this->cs = ClassSubject::create([
            'class_id' => $this->class->id, 'subject_id' => $subject->id,
            'coefficient' => 2, 'academic_year_id' => $this->year->id,
        ]);

        GradingConfig::create([
            'school_id' => $this->school->id, 'classroom_type_id' => $this->type->id, 'name' => 'Config',
            'is_active' => true, 'passing_score' => 10, 'default_max_score' => 20,
            'class_weight' => 1, 'comp_weight' => 1, 'round_precision' => 2,
            'mentions' => GradingConfig::defaultMentions(),
        ]);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(Roles::ADMINISTRATOR);

        return $user;
    }

    private function student(): Student
    {
        $u = User::factory()->create();
        $s = Student::create([
            'user_id' => $u->id, 'matricule' => 'M' . Str::random(6),
            'firstname' => 'P', 'lastname' => Str::random(5), 'gender' => 'male', 'birth_date' => '2010-01-01',
        ]);
        Enrollment::create([
            'school_id' => $this->school->id, 'student_id' => $s->id, 'class_id' => $this->class->id,
            'academic_year_id' => $this->year->id, 'enrollment_code' => 'E' . Str::random(8),
            'enrollment_date' => now(), 'status' => 'active',
        ]);

        return $s;
    }

    private function mark(Student $student, EvaluationType $type, float $score): void
    {
        $template = EvaluationTemplate::create([
            'academic_period_id' => $this->period->id, 'evaluation_type_id' => $type->id,
            'class_type_id' => $this->type->id, 'name' => Str::random(6),
            'coefficient' => 1, 'max_score' => 20, 'date' => '2025-10-01',
        ]);
        $evaluation = Evaluation::create([
            'evaluation_template_id' => $template->id, 'class_subject_id' => $this->cs->id,
            'date' => '2025-10-01', 'status' => 'published',
        ]);
        Mark::create(['evaluation_id' => $evaluation->id, 'student_id' => $student->id, 'score' => $score, 'absent' => false]);
    }

    public function test_validate_creates_locked_report_cards_with_classe_compo(): void
    {
        $continu = EvaluationType::create(['name' => 'Devoir', 'category' => 'continu']);
        $compo   = EvaluationType::create(['name' => 'Composition', 'category' => 'composition']);

        $student = $this->student();
        $this->mark($student, $continu, 12);
        $this->mark($student, $compo, 16);

        $this->actingAs($this->admin())
            ->post(route('bulletins.validate'), [
                'class_id' => $this->class->id,
                'academic_period_id' => $this->period->id,
                'observations' => 'Bon trimestre',
            ])
            ->assertRedirect();

        $card = ReportCard::where('student_id', $student->id)->where('academic_period_id', $this->period->id)->firstOrFail();
        $this->assertNotNull($card->locked_at);
        $this->assertStringStartsWith('BUL-', $card->reference);
        $this->assertSame(14.0, (float) $card->average);   // (12 + 16)/2
        $this->assertSame(1, $card->rank);

        $line = $card->payload['lines'][0];
        $this->assertEquals(12, $line['classe']);
        $this->assertEquals(16, $line['compo']);
        $this->assertEquals(14, $line['moyenne']);
    }

    public function test_download_returns_pdf_after_validation(): void
    {
        $continu = EvaluationType::create(['name' => 'Devoir', 'category' => 'continu']);
        $student = $this->student();
        $this->mark($student, $continu, 15);

        $admin = $this->admin();

        $this->actingAs($admin)->post(route('bulletins.validate'), [
            'class_id' => $this->class->id, 'academic_period_id' => $this->period->id,
        ])->assertRedirect();

        $response = $this->actingAs($admin)->get(
            route('bulletins.download', $student->id) . '?academic_period_id=' . $this->period->id
        );

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('content-type'));
    }
}
