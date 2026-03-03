<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(LevelSeeder::class);

        // Create roles and permissions first
        $this->call(RolesAndPermissionsSeeder::class);

        // Then create demo school data
        $this->call(SchoolDemoSeeder::class);
    }
}
