<?php

namespace Database\Seeders;

use App\Models\EvaluationType;
use Illuminate\Database\Seeder;

class ExamenTypeSeeder extends Seeder
{
    /**
     * Seed exam types.
     */
    public function run(): void
    {
        $examTypes = [
            [
                'name' => 'Interrogation',
                'category' => 'continu',
                'description' => 'Évaluation courte et fréquente permettant de vérifier la compréhension immédiate des notions récentes.',
            ],
            [
                'name' => 'Devoir',
                'category' => 'continu',
                'description' => 'Évaluation écrite planifiée portant sur une partie définie du programme pour mesurer les acquis de l’élève.',
            ],
            [
                'name' => 'Composition',
                'category' => 'composition',
                'description' => 'Évaluation de synthèse couvrant un ensemble large de chapitres, généralement en fin de période académique.',
            ],
        ];

        foreach ($examTypes as $type) {
            EvaluationType::updateOrCreate(
                ['name' => $type['name']],
                ['category' => $type['category'], 'description' => $type['description']]
            );
        }
    }
}
