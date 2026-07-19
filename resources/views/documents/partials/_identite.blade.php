{{-- Bloc d'identité de l'élève, réutilisable par tous les documents. --}}
<table class="ident">
    <tr><td class="ident-label">Nom &amp; Prénom(s)</td><td class="ident-value">{{ $v['eleve.nom_complet'] ?? '' }}</td></tr>
    <tr><td class="ident-label">Matricule</td><td class="ident-value">{{ $v['eleve.matricule'] ?? '' }}</td></tr>
    <tr><td class="ident-label">Né(e) le</td><td class="ident-value">{{ $v['eleve.date_naissance'] ?? '' }} à {{ $v['eleve.lieu_naissance'] ?? '' }}</td></tr>
    <tr><td class="ident-label">Sexe</td><td class="ident-value">{{ $v['eleve.sexe'] ?? '' }}</td></tr>
    @if(!empty($v['eleve.nationalite']))
    <tr><td class="ident-label">Nationalité</td><td class="ident-value">{{ $v['eleve.nationalite'] }}</td></tr>
    @endif
</table>

<style>
    .ident { width: 100%; border-collapse: collapse; margin: 18px 0; }
    .ident td { padding: 5px 8px; border: 1px solid #d0d0d0; font-size: 12.5px; }
    .ident-label { width: 34%; background: #f5f5f5; font-weight: bold; }
</style>
