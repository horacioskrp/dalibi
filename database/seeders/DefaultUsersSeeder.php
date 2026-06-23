<?php

namespace Database\Seeders;

use App\Constants\Roles;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DefaultUsersSeeder extends Seeder
{
    /** Mot de passe par défaut commun (À CHANGER en production). */
    private const PASSWORD = 'password';

    public function run(): void
    {
        // École par défaut (dépendance des seeders de classes)
        if (! School::query()->exists()) {
            School::create([
                'name'        => 'École Centrale',
                'level'       => 'primaire',
                'code'        => 'ECOLE001',
                'address'     => 'Lomé, Togo',
                'phone'       => '+228 22 123 456',
                'email'       => 'contact@dalibi.tg',
                'principal'   => 'Directeur École',
                'description' => 'École de démonstration',
                'active'      => true,
            ]);
        }

        // Un compte de démonstration par rôle
        $users = [
            ['Admin', 'Système', 'admin@dalibi.tg', Roles::ADMINISTRATOR],
            ['Daniel', 'Directeur', 'directeur@dalibi.tg', Roles::DIRECTOR],
            ['Estelle', 'Enseignante', 'enseignant@dalibi.tg', Roles::TEACHER],
            ['Claire', 'Comptable', 'comptable@dalibi.tg', Roles::ACCOUNTING],
            ['Isabelle', 'Secrétaire', 'secretaire@dalibi.tg', Roles::SECRETARIAT],
        ];

        foreach ($users as [$firstname, $lastname, $email, $role]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'firstname'         => $firstname,
                    'lastname'          => $lastname,
                    'gender'            => 'female',
                    'password'          => self::PASSWORD,
                    'is_demo'           => true,
                    'email_verified_at' => Carbon::now(),
                ],
            );

            $user->syncRoles([$role]);

            if (! $user->natricule) {
                $user->generateMatricule();
                $user->save();
            }

            $this->command?->info("• {$email} ({$role})");
        }

        $this->command?->warn('Comptes de démonstration créés — mot de passe : "' . self::PASSWORD . '". À CHANGER en production.');
    }
}
