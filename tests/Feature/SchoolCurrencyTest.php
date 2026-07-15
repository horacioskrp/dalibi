<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\School;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SchoolCurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_currency_symbol_helper(): void
    {
        $this->assertSame('₦', School::factory()->make(['currency' => 'NGN'])->currencySymbol());
        $this->assertSame('FCFA', School::factory()->make(['currency' => 'XOF'])->currencySymbol());
        // Code inconnu / vide → repli.
        $this->assertSame('FCFA', School::factory()->make(['currency' => null])->currencySymbol());
    }

    public function test_currency_is_shared_to_the_frontend(): void
    {
        School::factory()->create(['currency' => 'GHS']);

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('settings.currency.code', 'GHS')
                ->where('settings.currency.symbol', 'GH₵')
            );
    }

    public function test_update_persists_a_valid_currency(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMINISTRATOR);
        $school = School::factory()->create(['currency' => 'XOF']);

        $this->actingAs($admin)
            ->put(route('schools.update', $school), [
                'name'     => $school->name,
                'code'     => $school->code,
                'currency' => 'NGN',
            ])
            ->assertRedirect();

        $this->assertSame('NGN', $school->fresh()->currency);
    }

    public function test_update_rejects_an_invalid_currency(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMINISTRATOR);
        $school = School::factory()->create(['currency' => 'XOF']);

        $this->actingAs($admin)
            ->put(route('schools.update', $school), [
                'name'     => $school->name,
                'code'     => $school->code,
                'currency' => 'ZZZ',
            ])
            ->assertSessionHasErrors('currency');

        $this->assertSame('XOF', $school->fresh()->currency);
    }
}
