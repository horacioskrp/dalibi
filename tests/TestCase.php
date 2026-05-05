<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    /**
     * Exécuté avant chaque migrate:fresh dans RefreshDatabase.
     * Désactive les FK SQLite pour permettre les dropColumn dans les migrations.
     */
    protected function beforeRefreshingDatabase()
    {
        if (config('database.connections.' . config('database.default') . '.driver') === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
        }
    }
}
