<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        Storage::fake('secure');
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
            'user_id' => User::factory()->create()->id, 'active' => true, 'matricule' => 'DOC001',
        ]);
    }

    public function test_can_add_document_in_student_folder(): void
    {
        $student = $this->student();

        $this->actingAs($this->admin())
            ->post(route('students.documents.store', $student), [
                'name' => 'Extrait de naissance',
                'file' => UploadedFile::fake()->create('acte.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect();

        $doc = StudentDocument::first();
        $this->assertNotNull($doc);
        $this->assertEquals('Extrait de naissance', $doc->name);
        // Rangé dans le dossier propre à l'élève
        $this->assertStringStartsWith("students/{$student->id}/documents/", $doc->path);
        Storage::disk('secure')->assertExists($doc->path);
    }

    public function test_document_requires_name_and_file(): void
    {
        $student = $this->student();

        $this->actingAs($this->admin())
            ->post(route('students.documents.store', $student), ['name' => ''])
            ->assertSessionHasErrors(['name', 'file']);
    }

    public function test_can_delete_document(): void
    {
        $student = $this->student();
        $this->actingAs($this->admin())->post(route('students.documents.store', $student), [
            'name' => 'Photo passeport',
            'file' => UploadedFile::fake()->image('passport.jpg'),
        ]);
        $doc = StudentDocument::first();

        $this->actingAs($this->admin())
            ->delete(route('students.documents.destroy', [$student, $doc]))
            ->assertRedirect();

        $this->assertDatabasemissing('student_documents', ['id' => $doc->id]);
        Storage::disk('secure')->assertMissing($doc->path);
    }

    public function test_deleting_student_removes_their_folder(): void
    {
        $student = $this->student();
        $this->actingAs($this->admin())->post(route('students.documents.store', $student), [
            'name' => 'Doc',
            'file' => UploadedFile::fake()->create('d.pdf', 10, 'application/pdf'),
        ]);
        $path = StudentDocument::first()->path;

        $this->actingAs($this->admin())->delete(route('students.destroy', $student));

        // Le dossier privé (et son contenu) est supprimé avec l'élève
        Storage::disk('secure')->assertMissing($path);
    }
}
