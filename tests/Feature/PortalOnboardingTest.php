<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Mail\GuardianInvitation;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class PortalOnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function staff(string $role): User
    {
        $u = User::factory()->create();
        $u->assignRole($role);

        return $u;
    }

    private function student(string $matricule): Student
    {
        $u = User::factory()->create();

        return Student::create(['user_id' => $u->id, 'matricule' => $matricule, 'firstname' => 'A', 'lastname' => 'B', 'gender' => 'male', 'birth_date' => '2010-01-01']);
    }

    private function guardian(): Guardian
    {
        return Guardian::create(['first_name' => 'P', 'last_name' => 'Parent', 'email' => Str::random(8) . '@ex.com', 'is_active' => true]);
    }

    public function test_secretariat_creates_guardian_links_student_and_sends_invitation(): void
    {
        Mail::fake();
        $this->student('MAT-001');

        $this->actingAs($this->staff(Roles::SECRETARIAT))
            ->post(route('guardians.store'), [
                'first_name' => 'Jean', 'last_name' => 'Dupont', 'email' => 'jean@ex.com',
                'student_matricules' => ['MAT-001'], 'send_invitation' => true,
            ])->assertRedirect();

        $guardian = Guardian::where('email', 'jean@ex.com')->firstOrFail();
        $this->assertSame(1, $guardian->children()->count());
        // Le mail d'invitation est mis en file (GuardianInvitation implémente ShouldQueue).
        Mail::assertQueued(GuardianInvitation::class);
    }

    public function test_teacher_cannot_manage_portal_accounts(): void
    {
        $this->actingAs($this->staff(Roles::TEACHER))
            ->post(route('guardians.store'), ['first_name' => 'X', 'last_name' => 'Y', 'email' => 'x@ex.com'])
            ->assertForbidden();
    }

    public function test_reset_password_activates_account_and_allows_login(): void
    {
        $guardian = $this->guardian();
        $token = $guardian->issueResetToken();

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $guardian->email, 'token' => $token,
            'password' => 'motdepasse1', 'password_confirmation' => 'motdepasse1',
        ])->assertOk()->assertJsonStructure(['token', 'type']);

        // Le compte peut désormais se connecter
        $this->postJson('/api/v1/auth/login', ['login' => $guardian->email, 'password' => 'motdepasse1'])->assertOk();

        // Le jeton est consommé
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $guardian->email, 'token' => $token,
            'password' => 'autrepass1', 'password_confirmation' => 'autrepass1',
        ])->assertStatus(422);
    }

    public function test_forgot_password_is_generic(): void
    {
        Mail::fake();
        $guardian = $this->guardian();

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $guardian->email])->assertOk();
        Mail::assertQueued(GuardianInvitation::class);

        // E-mail inconnu : réponse identique, aucun envoi
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'inconnu@ex.com'])->assertOk();
        Mail::assertQueuedCount(1);
    }
}
