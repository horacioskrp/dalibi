<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder GLOBAL (démonstration / développement).
 *
 * = Données de référence (ReferenceDataSeeder) + données de démo (comptes de test,
 *   classes d'exemple, élèves fictifs).
 *
 * ⚠️ Ne pas exécuter en production : utilisez plutôt `ReferenceDataSeeder`
 *    (ou seulement `RolesAndPermissionsSeeder`).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Données de référence (rôles/permissions + catalogues prod-safe)
        $this->call(ReferenceDataSeeder::class);

        // 2) Données de démonstration
        $this->call(DefaultUsersSeeder::class);   // comptes de test (1 par rôle) + école par défaut
        $this->call(DocumentTemplateSeeder::class); // modèles de documents (requiert une école)
        $this->call(StudentTestSeeder::class);    // élèves fictifs (dev)
    }
}
