<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur administrateur
        $admin = User::create([
            'firstname' => 'Admin',
            'lastname' => 'User',
            'gender' => 'M',
            'birth_date' => '1990-01-01',
            'telephone' => '0123456789',
            'profile' => 'admin',
            'email' => 'admin@example.com',
            'address' => 'Adresse de l\'admin',
            'password' => Hash::make('password'),
        ]);

        // Assigner le rôle administrateur
        $admin->assignRole('administrateur');

        // Générer et assigner le matricule
        $admin->natricule = $admin->generateMatricule();
        $admin->save();
    }
}
