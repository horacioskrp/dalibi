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

        // Create fee categories
        $this->call(FeeCategorieSeeder::class);

        // Seed evaluation types
        $this->call(ExamenTypeSeeder::class);
    }
}
