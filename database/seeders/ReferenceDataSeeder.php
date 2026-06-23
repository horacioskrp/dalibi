<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Données de référence sûres pour la PRODUCTION (idempotentes, sans données de démo).
 *
 * Inclut les rôles & permissions + les catalogues de base nécessaires au fonctionnement
 * de l'application. N'inclut PAS : comptes de démo, classes d'exemple, élèves de test.
 *
 * NB : les modèles de documents (DocumentTemplateSeeder) nécessitent une école existante ;
 * lancez-le séparément après avoir créé votre établissement.
 */
class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class, // rôles & permissions (essentiel)
            LevelSeeder::class,               // niveaux scolaires
            ClassTypeSeeder::class,           // types de classes
            ClassroomSeeder::class,           // classes standard (PS → Tle) — requiert les types
            SubjectSeeder::class,             // matières
            FeeCategorieSeeder::class,        // catégories de frais
            ExamenTypeSeeder::class,          // types d'évaluation
            ScholarshipSeeder::class,         // bourses
        ]);
    }
}
