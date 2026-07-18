{{-- Corps « Attestation de fréquentation » (source = blade).
     Placé dans <main class="doc-body"> par DocumentRenderer. --}}
<h1>Attestation de Fréquentation</h1>

@if(!empty($v['document.reference']))
    <p class="doc-ref">N° {{ $v['document.reference'] }}</p>
@endif

<p>
    Je soussigné(e), <strong>{{ $v['signataire.titre'] ?? 'Le Directeur' }}</strong>
    de l'établissement <strong>{{ $v['ecole.nom'] ?? '' }}</strong>, atteste que l'élève
    ci-après identifié(e) :
</p>

@include('documents.partials._identite')

<p>
    fréquente effectivement notre établissement en classe de
    <strong>{{ $v['classe.nom'] ?? '' }}</strong> durant l'année scolaire
    <strong>{{ $v['annee_scolaire'] ?? '' }}</strong>, et y suit assidûment les enseignements.
</p>

<p>
    La présente attestation est délivrée à l'intéressé(e) pour servir et valoir
    ce que de droit.
</p>

<style>
    .doc-body p { margin: 12px 0; text-align: justify; }
    .doc-ref { text-align: center; font-style: italic; color: #555; margin-top: -8px; }
</style>
