<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoragePrivacyTest extends TestCase
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

    private function student(): Student
    {
        return Student::create([
            'firstname' => 'Koffi', 'lastname' => 'Mensah', 'gender' => 'male', 'birth_date' => '2012-01-01',
            'user_id' => User::factory()->create()->id, 'active' => true, 'matricule' => 'SEC001',
        ]);
    }

    public function test_photo_is_stored_on_private_disk(): void
    {
        Storage::fake('secure');
        Storage::fake('media');
        $student = $this->student();

        $this->actingAs($this->admin())
            ->post(route('students.photo.upload', $student), ['photo' => UploadedFile::fake()->image('p.jpg')])
            ->assertRedirect();

        $path = $student->fresh()->profile_photo;
        $this->assertNotNull($path);
        Storage::disk('secure')->assertExists($path);   // privé
        Storage::disk('media')->assertMissing($path);    // pas sur le disque public
    }

    public function test_photo_view_requires_authentication(): void
    {
        $student = $this->student();
        // Invité → redirigé vers login (jamais servi publiquement)
        $this->get(route('students.photo.view', $student))->assertRedirect(route('login'));
    }

    public function test_receipt_verification_forbidden_for_teacher(): void
    {
        $teacher = User::factory()->create();
        $teacher->assignRole(Roles::TEACHER);

        $this->actingAs($teacher)
            ->get(route('receipts.verify', ['code' => 'X']))
            ->assertForbidden();
    }
}
