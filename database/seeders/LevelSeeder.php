<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            [
                'name' => 'maternelle',
                'description' => 'Niveau d\'initiation pour la petite enfance, axé sur l\'éveil, la socialisation et les premières compétences de base.',
            ],
            [
                'name' => 'primaire',
                'description' => 'Niveau fondamental pour l\'apprentissage de la lecture, de l\'écriture, du calcul et des connaissances générales.',
            ],
            [
                'name' => 'college',
                'description' => 'Niveau intermédiaire qui consolide les acquis du primaire et prépare progressivement aux exigences du lycée.',
            ],
            [
                'name' => 'lycee',
                'description' => 'Niveau secondaire supérieur orienté vers l\'approfondissement disciplinaire et la préparation aux études supérieures.',
            ],
        ];

        foreach ($levels as $level) {
            Level::updateOrCreate(
                ['name' => $level['name']],
                ['description' => $level['description']]
            );
        }
    }
}
