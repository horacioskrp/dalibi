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

        // Create admin user (requires roles)
        $this->call(CreateAdminSeeder::class);

        // Create classroom types then classrooms
        $this->call(ClassTypeSeeder::class);
        $this->call(ClassroomSeeder::class);

        // Seed subjects
        $this->call(SubjectSeeder::class);

        // Create fee categories
        $this->call(FeeCategorieSeeder::class);

        // Seed evaluation types
        $this->call(ExamenTypeSeeder::class);

        // Seed scholarships
        $this->call(ScholarshipSeeder::class);

        // Seed test students (dev only)
        $this->call(StudentTestSeeder::class);
    }
}
