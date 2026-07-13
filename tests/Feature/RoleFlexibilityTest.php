<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\MatriculeService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Vérifie qu'un rôle PERSONNALISÉ (créé à l'exécution) doté des bonnes permissions
 * accède aux fonctions autrefois verrouillées à un rôle précis — le système est
 * piloté par les permissions, pas par des rôles codés en dur.
 */
class RoleFlexibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    /** @param array<int,string> $permissions */
    private function userWithCustomRole(string $roleName, array $permissions): User
    {
        $role = Role::firstOrCreate(['name' => $roleName]);
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user->fresh();
    }

    public function test_custom_role_with_permission_can_manage_evaluation_types(): void
    {
        // Auparavant réservé à administrateur/directeur (policy en dur).
        $censeur = $this->userWithCustomRole('censeur', ['view_evaluation_types', 'create_evaluation_types']);

        $this->actingAs($censeur)
            ->post(route('evaluation-types.store'), ['name' => 'Interrogation', 'category' => 'continu'])
            ->assertRedirect();

        $this->assertDatabaseHas('evaluation_types', ['name' => 'Interrogation']);
    }

    public function test_custom_role_without_permission_is_forbidden(): void
    {
        $lecteur = $this->userWithCustomRole('lecteur', ['view_evaluation_types']);

        $this->actingAs($lecteur)
            ->post(route('evaluation-types.store'), ['name' => 'Interro', 'category' => 'continu'])
            ->assertForbidden();

        $this->assertDatabaseMissing('evaluation_types', ['name' => 'Interro']);
    }

    public function test_matricule_prefix_is_configurable_for_a_custom_role(): void
    {
        config(['matricule.role_prefixes' => ['censeur' => 'CENS']]);
        $service = app(MatriculeService::class);

        $matricule = $service->generateUserMatricule('censeur');

        $this->assertStringStartsWith('CENS', $matricule);
        $this->assertSame('censeur', $service->getRoleFromMatricule($matricule));
    }

    public function test_unknown_role_falls_back_to_generic_prefix(): void
    {
        $service = app(MatriculeService::class);

        $this->assertStringStartsWith('USR', $service->generateUserMatricule('role_inexistant'));
    }
}
