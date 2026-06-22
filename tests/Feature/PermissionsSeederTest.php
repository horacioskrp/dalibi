<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Constants\Roles;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PermissionsSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_all_module_permissions_are_seeded(): void
    {
        $this->assertSame(count(Permissions::all()), Permission::count());

        // Quelques permissions de modules récents doivent exister
        foreach (['view_archives', 'create_official_exams', 'restore_backups', 'execute_promotion', 'manage_file_storage'] as $name) {
            $this->assertDatabaseHas('permissions', ['name' => $name]);
        }
    }

    public function test_admin_has_every_permission(): void
    {
        $admin = Role::findByName(Roles::ADMINISTRATOR);
        $this->assertSame(Permission::count(), $admin->permissions()->count());
    }

    public function test_non_admin_roles_have_scoped_permissions(): void
    {
        $teacher = Role::findByName(Roles::TEACHER);
        $this->assertTrue($teacher->hasPermissionTo('create_grades'));
        $this->assertTrue($teacher->hasPermissionTo('create_marks'));
        $this->assertFalse($teacher->hasPermissionTo('delete_users'));
        $this->assertLessThan(Permission::count(), $teacher->permissions()->count());

        $accounting = Role::findByName(Roles::ACCOUNTING);
        $this->assertTrue($accounting->hasPermissionTo('create_expenses'));
        $this->assertFalse($accounting->hasPermissionTo('create_grades'));
    }
}
