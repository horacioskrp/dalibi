<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ────────────────────────────────────────────────────────────

    private function user(): User
    {
        return User::factory()->create();
    }

    /**
     * Crée un Student directement en DB (bypass formulaire).
     * user_id est requis NOT NULL dans la table students.
     * Un matricule unique est généré pour éviter les collisions.
     */
    private function makeStudent(array $overrides = []): Student
    {
        static $counter = 0;
        $counter++;

        return Student::create(array_merge([
            'firstname'  => 'Koffi',
            'lastname'   => 'Amegah',
            'gender'     => 'male',
            'birth_date' => '2010-05-15',
            'user_id'    => $this->user()->id,
            'active'     => true,
            'matricule'  => 'TESSTU' . str_pad($counter, 3, '0', STR_PAD_LEFT),
        ], $overrides));
    }

    /**
     * Payload minimal valide pour créer un élève.
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'firstname'  => 'Koffi',
            'lastname'   => 'Amegah',
            'gender'     => 'male',
            'birth_date' => '2010-05-15',
            'active'     => true,

            'information' => [
                'admission_type' => 'new',
            ],

            'parent' => [
                'father_firstname' => 'Jean',
                'father_lastname'  => 'Amegah',
                'mother_firstname' => 'Marie',
                'mother_lastname'  => 'Amegah',
            ],

            'medical' => [],
        ], $overrides);
    }

    // ─── Authentification ────────────────────────────────────────────────────

    public function test_guest_cannot_access_students_index(): void
    {
        $this->get(route('students.index'))
            ->assertRedirect(route('login'));
    }

    public function test_guest_cannot_create_student(): void
    {
        $this->post(route('students.store'), $this->validPayload())
            ->assertRedirect(route('login'));
    }

    public function test_guest_cannot_delete_student(): void
    {
        $student = $this->makeStudent();

        $this->delete(route('students.destroy', $student))
            ->assertRedirect(route('login'));

        $this->assertDatabaseHas('students', ['id' => $student->id]);
    }

    // ─── Index ───────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_students_list(): void
    {
        $this->makeStudent(['firstname' => 'Koffi', 'lastname' => 'A', 'gender' => 'male', 'birth_date' => '2010-01-01']);
        $this->makeStudent(['firstname' => 'Afi', 'lastname' => 'B', 'gender' => 'female', 'birth_date' => '2011-03-20']);

        $this->actingAs($this->user())
            ->get(route('students.index'))
            ->assertOk();
    }

    public function test_index_can_filter_by_search(): void
    {
        // SQLite ne supporte pas ILIKE (opérateur PostgreSQL) — on teste uniquement la route
        if (config('database.default') === 'sqlite' || DB::getDriverName() === 'sqlite') {
            $this->markTestSkipped('ILIKE non supporté par SQLite');
        }

        $this->makeStudent(['firstname' => 'Koffi', 'lastname' => 'Mensah', 'gender' => 'male', 'birth_date' => '2010-01-01']);
        $this->makeStudent(['firstname' => 'Afi', 'lastname' => 'Togbe', 'gender' => 'female', 'birth_date' => '2011-01-01']);

        $this->actingAs($this->user())
            ->get(route('students.index', ['search' => 'Mensah']))
            ->assertOk();
    }

    public function test_index_can_filter_by_gender(): void
    {
        $this->actingAs($this->user())
            ->get(route('students.index', ['gender' => 'female']))
            ->assertOk();
    }

    public function test_index_can_filter_by_status_active(): void
    {
        $this->makeStudent(['firstname' => 'Koffi', 'lastname' => 'A', 'gender' => 'male', 'birth_date' => '2010-01-01', 'active' => true]);
        $this->makeStudent(['firstname' => 'Afi', 'lastname' => 'B', 'gender' => 'female', 'birth_date' => '2011-01-01', 'active' => false]);

        $this->actingAs($this->user())
            ->get(route('students.index', ['status' => 'active']))
            ->assertOk();
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_create_form(): void
    {
        $this->actingAs($this->user())
            ->get(route('students.create'))
            ->assertOk();
    }

    // ─── Store ───────────────────────────────────────────────────────────────

    public function test_can_create_student_with_valid_data(): void
    {
        $this->actingAs($this->user())
            ->post(route('students.store'), $this->validPayload())
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseHas('students', [
            'firstname' => 'Koffi',
            'lastname'  => 'Amegah',
            'gender'    => 'male',
        ]);
    }

    public function test_creating_student_also_creates_parent_info(): void
    {
        $this->actingAs($this->user())
            ->post(route('students.store'), $this->validPayload())
            ->assertRedirect();

        $student = Student::where('firstname', 'Koffi')->first();
        $this->assertNotNull($student);
        $this->assertDatabaseHas('student_parents', [
            'student_id'       => $student->id,
            'father_firstname' => 'Jean',
            'mother_firstname' => 'Marie',
        ]);
    }

    public function test_creating_student_also_creates_information(): void
    {
        $this->actingAs($this->user())
            ->post(route('students.store'), $this->validPayload())
            ->assertRedirect();

        $student = Student::where('firstname', 'Koffi')->first();
        $this->assertDatabaseHas('student_information', [
            'student_id'     => $student->id,
            'admission_type' => 'new',
        ]);
    }

    public function test_cannot_create_student_without_firstname(): void
    {
        $payload = $this->validPayload(['firstname' => '']);

        $this->actingAs($this->user())
            ->post(route('students.store'), $payload)
            ->assertSessionHasErrors('firstname');

        $this->assertDatabaseEmpty('students');
    }

    public function test_cannot_create_student_without_lastname(): void
    {
        $this->actingAs($this->user())
            ->post(route('students.store'), $this->validPayload(['lastname' => '']))
            ->assertSessionHasErrors('lastname');
    }

    public function test_cannot_create_student_with_invalid_gender(): void
    {
        $this->actingAs($this->user())
            ->post(route('students.store'), $this->validPayload(['gender' => 'unknown']))
            ->assertSessionHasErrors('gender');
    }

    public function test_cannot_create_student_without_birth_date(): void
    {
        $this->actingAs($this->user())
            ->post(route('students.store'), $this->validPayload(['birth_date' => '']))
            ->assertSessionHasErrors('birth_date');
    }

    public function test_cannot_create_student_with_invalid_admission_type(): void
    {
        $payload = $this->validPayload();
        $payload['information']['admission_type'] = 'invalid';

        $this->actingAs($this->user())
            ->post(route('students.store'), $payload)
            ->assertSessionHasErrors('information.admission_type');
    }

    public function test_cannot_create_student_without_father_firstname(): void
    {
        $payload = $this->validPayload();
        $payload['parent']['father_firstname'] = '';

        $this->actingAs($this->user())
            ->post(route('students.store'), $payload)
            ->assertSessionHasErrors('parent.father_firstname');
    }

    public function test_cannot_create_student_with_duplicate_email(): void
    {
        $this->makeStudent([
            'firstname'  => 'Afi',
            'lastname'   => 'Togbe',
            'gender'     => 'female',
            'birth_date' => '2011-01-01',
            'email'      => 'afi@school.tg',
        ]);

        $payload = $this->validPayload(['email' => 'afi@school.tg']);

        $this->actingAs($this->user())
            ->post(route('students.store'), $payload)
            ->assertSessionHasErrors('email');
    }

    // ─── Show ────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_student_detail(): void
    {
        $student = $this->makeStudent();

        $this->actingAs($this->user())
            ->get(route('students.show', $student))
            ->assertOk();
    }

    // ─── History ─────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_student_history(): void
    {
        $student = $this->makeStudent();

        $this->actingAs($this->user())
            ->get(route('students.history', $student))
            ->assertOk();
    }

    // ─── Edit / Update ───────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_edit_form(): void
    {
        $student = $this->makeStudent();

        $this->actingAs($this->user())
            ->get(route('students.edit', $student))
            ->assertOk();
    }

    public function test_can_update_student_with_valid_data(): void
    {
        $student = $this->makeStudent();
        $student->information()->create(['admission_type' => 'new']);
        $student->parentInfo()->create([
            'father_firstname' => 'Jean',
            'father_lastname'  => 'Amegah',
            'mother_firstname' => 'Marie',
            'mother_lastname'  => 'Amegah',
        ]);
        $student->medicalInfo()->create([]);

        $payload = $this->validPayload([
            'firstname' => 'Kossi',
            'lastname'  => 'Amegah',
        ]);

        $this->actingAs($this->user())
            ->put(route('students.update', $student), $payload)
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseHas('students', [
            'id'        => $student->id,
            'firstname' => 'Kossi',
        ]);
    }

    // ─── Bulk Status ─────────────────────────────────────────────────────────

    public function test_can_bulk_activate_students(): void
    {
        $s1 = $this->makeStudent(['firstname' => 'A', 'lastname' => 'B', 'gender' => 'male', 'birth_date' => '2010-01-01', 'active' => false]);
        $s2 = $this->makeStudent(['firstname' => 'C', 'lastname' => 'D', 'gender' => 'female', 'birth_date' => '2011-01-01', 'active' => false]);

        $this->actingAs($this->user())
            ->post(route('students.bulk-status'), [
                'student_ids' => [$s1->id, $s2->id],
                'action'      => 'activate',
            ])
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseHas('students', ['id' => $s1->id, 'active' => true]);
        $this->assertDatabaseHas('students', ['id' => $s2->id, 'active' => true]);
    }

    public function test_can_bulk_deactivate_students(): void
    {
        $s1 = $this->makeStudent(['firstname' => 'A', 'lastname' => 'B', 'gender' => 'male', 'birth_date' => '2010-01-01', 'active' => true]);
        $s2 = $this->makeStudent(['firstname' => 'C', 'lastname' => 'D', 'gender' => 'female', 'birth_date' => '2011-01-01', 'active' => true]);

        $this->actingAs($this->user())
            ->post(route('students.bulk-status'), [
                'student_ids' => [$s1->id, $s2->id],
                'action'      => 'deactivate',
            ])
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseHas('students', ['id' => $s1->id, 'active' => false]);
        $this->assertDatabaseHas('students', ['id' => $s2->id, 'active' => false]);
    }

    public function test_bulk_status_requires_valid_action(): void
    {
        $student = $this->makeStudent(['firstname' => 'A', 'lastname' => 'B', 'gender' => 'male', 'birth_date' => '2010-01-01']);

        $this->actingAs($this->user())
            ->post(route('students.bulk-status'), [
                'student_ids' => [$student->id],
                'action'      => 'invalid',
            ])
            ->assertSessionHasErrors('action');
    }

    // ─── Destroy ─────────────────────────────────────────────────────────────

    public function test_can_delete_student(): void
    {
        $student = $this->makeStudent();

        $this->actingAs($this->user())
            ->delete(route('students.destroy', $student))
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }
}
