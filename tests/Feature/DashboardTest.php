<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_defaults_to_active_academic_year()
    {
        $school = School::factory()->create();
        AcademicYear::create(['school_id' => $school->id, 'year' => '2024-2025', 'start_date' => '2024-09-01', 'end_date' => '2025-07-31', 'active' => false]);
        $active = AcademicYear::create(['school_id' => $school->id, 'year' => '2025-2026', 'start_date' => '2025-09-01', 'end_date' => '2026-07-31', 'active' => true]);

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->where('selectedYearId', $active->id)
            );
    }

    public function test_dashboard_respects_selected_year_filter()
    {
        $school = School::factory()->create();
        $old    = AcademicYear::create(['school_id' => $school->id, 'year' => '2024-2025', 'start_date' => '2024-09-01', 'end_date' => '2025-07-31', 'active' => false]);
        AcademicYear::create(['school_id' => $school->id, 'year' => '2025-2026', 'start_date' => '2025-09-01', 'end_date' => '2026-07-31', 'active' => true]);

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard', ['academic_year_id' => $old->id]))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('selectedYearId', $old->id));
    }
}
