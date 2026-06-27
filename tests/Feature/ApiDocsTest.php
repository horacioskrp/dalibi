<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiDocsTest extends TestCase
{
    public function test_docs_are_not_accessible_outside_dev(): void
    {
        // Environnement de test (assimilé à la production) → 404.
        $this->get('/docs/api')->assertNotFound();
        $this->get('/docs/api/openapi.yaml')->assertNotFound();
    }

    public function test_docs_are_available_in_local(): void
    {
        $this->app['env'] = 'local';

        $this->get('/docs/api')->assertOk()->assertSee('redoc', false);
        $this->get('/docs/api/openapi.yaml')->assertOk();
    }
}
