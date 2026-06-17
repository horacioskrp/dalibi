<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use App\Models\School;
use Illuminate\Database\Seeder;

class DocumentTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $schoolId = School::query()->value('id');

        $templates = [
            [
                'category'        => 'certificat',
                'type'            => 'certificat_scolarite',
                'name'            => 'Certificat de scolarité (standard)',
                'description'     => 'Modèle officiel de certificat de scolarité.',
                'signatory_title' => 'Le Directeur',
                'content'         => <<<'HTML'
<h1>Certificat de scolarité</h1>
<p>Je soussigné(e), <strong>{{ signataire.titre }}</strong> de l'établissement <strong>{{ ecole.nom }}</strong>, certifie que :</p>
<p>L'élève <strong>{{ eleve.nom_complet }}</strong>, né(e) le {{ eleve.date_naissance }} à {{ eleve.lieu_naissance }}, matricule <strong>{{ eleve.matricule }}</strong>, est régulièrement inscrit(e) dans notre établissement en classe de <strong>{{ classe.nom }}</strong> au titre de l'année scolaire <strong>{{ annee_scolaire }}</strong>.</p>
<p>En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.</p>
<p style="text-align:right"><em>Réf. : {{ document.reference }}</em></p>
HTML,
            ],
            [
                'category'        => 'attestation',
                'type'            => 'attestation_frequentation',
                'name'            => 'Attestation de fréquentation (standard)',
                'description'     => 'Atteste de la fréquentation effective de l\'élève.',
                'signatory_title' => 'Le Directeur',
                'content'         => <<<'HTML'
<h1>Attestation de fréquentation</h1>
<p>Je soussigné(e), <strong>{{ signataire.titre }}</strong> de <strong>{{ ecole.nom }}</strong>, atteste que l'élève <strong>{{ eleve.nom_complet }}</strong>, matricule <strong>{{ eleve.matricule }}</strong>, fréquente effectivement notre établissement en classe de <strong>{{ classe.nom }}</strong> durant l'année scolaire <strong>{{ annee_scolaire }}</strong>.</p>
<p>Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
<p style="text-align:right"><em>Réf. : {{ document.reference }}</em></p>
HTML,
            ],
            [
                'category'        => 'certificat',
                'type'            => 'certificat_sortie',
                'name'            => 'Certificat de sortie (standard)',
                'description'     => 'Délivré lors du départ / radiation de l\'élève.',
                'signatory_title' => 'Le Directeur',
                'content'         => <<<'HTML'
<h1>Certificat de sortie</h1>
<p>Je soussigné(e), <strong>{{ signataire.titre }}</strong> de <strong>{{ ecole.nom }}</strong>, certifie que l'élève <strong>{{ eleve.nom_complet }}</strong>, né(e) le {{ eleve.date_naissance }} à {{ eleve.lieu_naissance }}, matricule <strong>{{ eleve.matricule }}</strong>, a quitté notre établissement à l'issue de l'année scolaire <strong>{{ annee_scolaire }}</strong>.</p>
<p>L'intéressé(e) est en règle vis-à-vis de l'établissement.</p>
<p style="text-align:right"><em>Réf. : {{ document.reference }}</em></p>
HTML,
            ],
        ];

        foreach ($templates as $tpl) {
            DocumentTemplate::updateOrCreate(
                ['type' => $tpl['type'], 'name' => $tpl['name']],
                array_merge($tpl, [
                    'school_id'      => $schoolId,
                    'header_enabled' => true,
                    'footer_enabled' => true,
                    'show_signature' => true,
                    'orientation'    => 'portrait',
                    'is_default'     => true,
                    'is_active'      => true,
                ])
            );
        }
    }
}
