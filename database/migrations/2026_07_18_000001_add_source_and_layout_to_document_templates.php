<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_templates', function (Blueprint $table) {
            // Source du corps : `wysiwyg` (HTML saisi via l'éditeur, comportement historique)
            // ou `blade` (mise en page prédéfinie livrée par le dev, choisie via `layout`).
            $table->string('source')->default('wysiwyg')->after('description');
            // Clé du layout Blade (ex. certificat_scolarite) — validée contre une liste blanche.
            $table->string('layout')->nullable()->after('source');
        });
    }

    public function down(): void
    {
        Schema::table('document_templates', function (Blueprint $table) {
            $table->dropColumn(['source', 'layout']);
        });
    }
};
