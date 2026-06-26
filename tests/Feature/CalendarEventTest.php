<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\AcademicYear;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarEventTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        AcademicYear::create(['year' => '2025-2026', 'start_date' => '2025-09-01', 'end_date' => '2026-07-31', 'active' => true]);
    }

    private function withRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_admin_can_create_and_list_events(): void
    {
        $admin = $this->withRole(Roles::ADMINISTRATOR);

        $this->actingAs($admin)->post(route('calendar.store'), [
            'title' => 'Rentrée scolaire', 'type' => 'event', 'start_date' => '2025-09-01', 'all_day' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('calendar_events', ['title' => 'Rentrée scolaire', 'type' => 'event']);
        $this->actingAs($admin)->get(route('calendar.index'))->assertOk();
    }

    public function test_permissions_by_role(): void
    {
        $event = ['title' => 'Composition', 'type' => 'exam', 'start_date' => '2025-12-10', 'all_day' => true];

        // Enseignant : consulte, ne crée pas.
        $teacher = $this->withRole(Roles::TEACHER);
        $this->actingAs($teacher)->get(route('calendar.index'))->assertOk();
        $this->actingAs($teacher)->post(route('calendar.store'), $event)->assertForbidden();

        // Directeur : crée.
        $director = $this->withRole(Roles::DIRECTOR);
        $this->actingAs($director)->post(route('calendar.store'), $event)->assertRedirect();
    }

    public function test_end_date_must_not_precede_start(): void
    {
        $admin = $this->withRole(Roles::ADMINISTRATOR);

        $this->actingAs($admin)->post(route('calendar.store'), [
            'title' => 'X', 'type' => 'event', 'start_date' => '2025-09-10', 'end_date' => '2025-09-01', 'all_day' => true,
        ])->assertSessionHasErrors('end_date');
    }
}
