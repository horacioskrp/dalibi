<?php

namespace Database\Seeders;

use App\Models\DocumentTag;
use Illuminate\Database\Seeder;

class DocumentTagSeeder extends Seeder
{
    /** Tags d'archivage par défaut (nom => couleur). Idempotent. */
    private const TAGS = [
        ['Administratif', '#3b82f6'],
        ['Comptable', '#22c55e'],
        ['Juridique', '#ef4444'],
        ['Ressources humaines', '#8b5cf6'],
        ['Courrier', '#f97316'],
        ['Pédagogique', '#06b6d4'],
        ['Officiel', '#eab308'],
        ['Contrat', '#ec4899'],
        ['Inspection', '#64748b'],
    ];

    public function run(): void
    {
        foreach (self::TAGS as [$name, $color]) {
            DocumentTag::resolve($name, $color);
        }
    }
}
