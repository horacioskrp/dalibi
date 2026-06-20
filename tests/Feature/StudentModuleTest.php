<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentModuleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->assignRole(Roles::ADMINISTRATOR);

        return $u;
    }

    public function test_student_stats_page_loads(): void
    {
        Student::create([
            'firstname' => 'A', 'lastname' => 'B', 'gender' => 'male', 'birth_date' => '2012-01-01',
            'user_id' => User::factory()->create()->id, 'active' => true, 'matricule' => 'ST001',
        ]);

        $this->actingAs($this->admin())
            ->get(route('students.stats'))
            ->assertOk();
    }

    public function test_change_class_reaffects_active_enrollment(): void
    {
        $school = School::factory()->create();
        $year = AcademicYear::create(['school_id' => $school->id, 'year' => '2025-2026', 'start_date' => '2025-09-01', 'end_date' => '2026-07-31', 'active' => true]);
        $c1 = Classroom::create(['name' => '6A', 'code' => '6A', 'capacity' => 40, 'active' => true]);
        $c2 = Classroom::create(['name' => '6B', 'code' => '6B', 'capacity' => 40, 'active' => true]);

        $student = Student::create([
            'firstname' => 'A', 'lastname' => 'B', 'gender' => 'male', 'birth_date' => '2012-01-01',
            'user_id' => User::factory()->create()->id, 'active' => true, 'matricule' => 'ST010',
        ]);
        $enr = Enrollment::create([
            'school_id' => $school->id, 'student_id' => $student->id, 'class_id' => $c1->id,
            'academic_year_id' => $year->id, 'enrollment_code' => 'INS-010', 'enrollment_date' => '2025-09-02',
            'status' => 'paid', 'academic_status' => 'en_cours',
        ]);

        $this->actingAs($this->admin())
            ->post(route('students.change-class', $student), ['class_id' => $c2->id])
            ->assertRedirect();

        $this->assertDatabaseHas('enrollments', ['id' => $enr->id, 'class_id' => $c2->id]);
    }
}
