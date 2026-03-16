<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\StudentInformation;
use App\Models\StudentParent;
use App\Models\StudentMedicalInfo;
use App\Models\User;
use App\Services\MatriculeService;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class StudentTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('fr_FR'); // Utiliser le français pour les données
        $matriculeService = new MatriculeService();

        // Générer 50 étudiants
        for ($i = 0; $i < 50; $i++) {
            $firstname = $faker->firstName();
            $lastname = $faker->lastName();
            $email = $faker->unique()->safeEmail();

            // Créer un utilisateur pour l'étudiant
            $user = User::create([
                'firstname' => $firstname,
                'lastname' => $lastname,
                'email' => $email,
                'gender' => $faker->randomElement(['male', 'female']),
                'birth_date' => $faker->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
                'telephone' => $faker->phoneNumber(),
                'address' => $faker->address(),
                'password' => Hash::make('password123'), // Mot de passe par défaut
                'email_verified_at' => now(),
            ]);

            // Générer le matricule (format simple pour éviter les conflits)
            $matricule = 'TEST' . str_pad($i + 1, 3, '0', STR_PAD_LEFT);

            // Créer l'étudiant
            $student = Student::create([
                'user_id' => $user->id,
                'matricule' => $matricule,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'gender' => $faker->randomElement(['male', 'female']),
                'birth_date' => $faker->dateTimeBetween('-18 years', '-6 years')->format('Y-m-d'),
                'place_of_birth' => $faker->city(),
                'nationality' => 'Togolaise',
                'address' => $faker->streetAddress(),
                'city' => $faker->city(),
                'phone' => $faker->phoneNumber(),
                'email' => $email,
                'active' => $faker->boolean(90), // 90% de chance d'être actif
            ]);

            // Créer les informations administratives
            StudentInformation::create([
                'student_id' => $student->id,
                'birth_certificate_number' => 'ACT-' . $faker->unique()->numberBetween(100000, 999999),
                'birth_certificate_issue_date' => $faker->dateTimeBetween('-10 years', '-1 year')->format('Y-m-d'),
                'birth_certificate_issue_place' => $faker->city(),
                'admission_type' => $faker->randomElement(['new', 'transfer', 're_admission']),
            ]);

            // Créer les informations parentales
            StudentParent::create([
                'student_id' => $student->id,
                'father_firstname' => $faker->firstName('male'),
                'father_lastname' => $faker->lastName(),
                'father_profession' => $faker->randomElement([
                    'Enseignant', 'Médecin', 'Ingénieur', 'Commerçant', 'Agriculteur',
                    'Fonctionnaire', 'Chauffeur', 'Électricien', 'Plombier', 'Menuisier'
                ]),
                'father_phone' => $faker->phoneNumber(),
                'mother_firstname' => $faker->firstName('female'),
                'mother_lastname' => $faker->lastName(),
                'mother_profession' => $faker->randomElement([
                    'Enseignante', 'Médecin', 'Infirmière', 'Commerçante', 'Fonctionnaire',
                    'Coiffeuse', 'Couturière', 'Ménagère', 'Vendeuse', 'Secrétaire'
                ]),
                'mother_phone' => $faker->phoneNumber(),
                'email' => $faker->email(),
            ]);

            // Créer les informations médicales
            StudentMedicalInfo::create([
                'student_id' => $student->id,
                'blood_group' => $faker->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                'allergies' => $faker->optional(0.3)->randomElement([
                    'Arachides', 'Lait', 'Oeufs', 'Poisson', 'Fruits de mer',
                    'Pollen', 'Acariens', 'Chats', 'Chiens', 'Poussière'
                ]),
                'vaccinations' => $faker->optional(0.8)->randomElement([
                    'DTC-Polio-Hib-HepB', 'Rougeole-Oreillons-Rubéole', 'Méningite',
                    'Hépatite B', 'Fièvre jaune', 'Tétanos', 'Diphtérie'
                ]),
                'emergency_contact_name' => $faker->name(),
                'emergency_contact_phone' => $faker->phoneNumber(),
            ]);
        }

        $this->command->info('50 étudiants de test créés avec succès !');
    }
}
