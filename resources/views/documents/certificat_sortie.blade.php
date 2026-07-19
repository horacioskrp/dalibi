{{-- Corps « Certificat de sortie / radiation » (source = blade).
     Placé dans <main class="doc-body"> par DocumentRenderer. --}}
<h1>Certificat de Sortie</h1>

@if(!empty($v['document.reference']))
    <p class="doc-ref">N° {{ $v['document.reference'] }}</p>
@endif

<p>
    Je soussigné(e), <strong>{{ $v['signataire.titre'] ?? 'Le Directeur' }}</strong>
    de l'établissement <strong>{{ $v['ecole.nom'] ?? '' }}</strong>, certifie que l'élève :
</p>

@include('documents.partials._identite')

<p>
    a été régulièrement inscrit(e) dans notre établissement, en classe de
    <strong>{{ $v['classe.nom'] ?? '' }}</strong> au titre de l'année scolaire
    <strong>{{ $v['annee_scolaire'] ?? '' }}</strong>, et a quitté l'établissement
    (rayé(e) des effectifs) à sa demande.
</p>

<p>
    L'intéressé(e) est à jour vis-à-vis de l'établissement à la date de délivrance
    du présent certificat, qui lui est remis pour servir et valoir ce que de droit.
</p>

<style>
    .doc-body p { margin: 12px 0; text-align: justify; }
    .doc-ref { text-align: center; font-style: italic; color: #555; margin-top: -8px; }
</style>
