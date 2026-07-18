<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            // Ministère de tutelle affiché en haut de l'en-tête officiel (éditable par école).
            $table->string('ministry', 255)
                ->default('Ministère des Enseignements Primaire, Secondaire et Technique')
                ->after('terme');
        });

        Schema::table('document_headers', function (Blueprint $table) {
            // Préréglage d'en-tête : `ministeriel` (gabarit officiel rendu par code, défaut)
            // ou `personnalise` (canevas glisser-déposer stocké dans `layout`).
            $table->string('preset')->default('ministeriel')->after('school_id');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('ministry');
        });
        Schema::table('document_headers', function (Blueprint $table) {
            $table->dropColumn('preset');
        });
    }
};
