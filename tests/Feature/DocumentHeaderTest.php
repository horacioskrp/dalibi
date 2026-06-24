<?php

namespace Tests\Feature;

use App\Constants\Roles;
use App\Models\DocumentHeader;
use App\Models\DocumentTemplate;
use App\Models\School;
use App\Models\User;
use App\Services\DocumentRenderer;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentHeaderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(Roles::ADMINISTRATOR);

        return $user;
    }

    public function test_update_persists_layout_and_watermark(): void
    {
        $school = School::factory()->create(['name' => 'École Test']);

        $layout = [
            'width'  => 760,
            'height' => 140,
            'elements' => [[
                'id' => 'a', 'type' => 'text', 'x' => 10, 'y' => 5, 'w' => 200,
                'content' => '{{ecole.nom}}', 'fontSize' => 14, 'bold' => true,
                'italic' => false, 'align' => 'left', 'color' => '#000000',
            ]],
        ];
        $watermark = [
            'enabled' => true, 'type' => 'text', 'text' => 'CONFIDENTIEL', 'image_path' => null,
            'opacity' => 10, 'size' => 60, 'rotation' => -30, 'color' => '#111111',
        ];

        $this->actingAs($this->admin())
            ->post(route('document-header.update'), [
                'layout'    => json_encode($layout),
                'watermark' => json_encode($watermark),
            ])
            ->assertRedirect();

        $header = DocumentHeader::where('school_id', $school->id)->firstOrFail();
        $this->assertSame(140, $header->layout['height']);
        $this->assertCount(1, $header->layout['elements']);
        $this->assertTrue($header->watermark['enabled']);
        $this->assertSame('CONFIDENTIEL', $header->watermark['text']);
    }

    public function test_renderer_uses_custom_header_and_watermark(): void
    {
        $school = School::factory()->create(['name' => 'École Custom']);

        $config = DocumentHeader::defaultLayout($school);
        $config['watermark']['enabled'] = true;
        $config['watermark']['text']    = 'CONFIDENTIEL';

        DocumentHeader::create([
            'school_id' => $school->id,
            'layout'    => $config['layout'],
            'watermark' => $config['watermark'],
        ]);

        $renderer = app(DocumentRenderer::class);

        $template = new DocumentTemplate([
            'header_enabled' => true,
            'show_signature' => false,
            'content'        => '<p>Corps du document</p>',
        ]);
        $template->setRelation('school', $school->load('documentHeader'));

        $html = $renderer->render($template, $renderer->resolveVariables($school));

        $this->assertStringContainsString('position:absolute', $html);  // en-tête personnalisé
        $this->assertStringContainsString('École Custom', $html);       // {{ecole.nom}} interpolé
        $this->assertStringContainsString('position:fixed', $html);     // filigrane
        $this->assertStringContainsString('CONFIDENTIEL', $html);
    }

    public function test_renderer_falls_back_to_default_header_without_config(): void
    {
        $school = School::factory()->create(['name' => 'Sans Config']);

        $renderer = app(DocumentRenderer::class);
        $template = new DocumentTemplate([
            'header_enabled' => true,
            'show_signature' => false,
            'content'        => '<p>Corps</p>',
        ]);
        $template->setRelation('school', $school);

        $html = $renderer->render($template, $renderer->resolveVariables($school));

        $this->assertStringContainsString('doc-header', $html);          // en-tête classique
        $this->assertStringNotContainsString('position:fixed', $html);   // pas de filigrane
    }
}
