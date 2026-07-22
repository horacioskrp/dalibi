<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Module « Niveaux » supprimé : table orpheline (aucune clé étrangère, aucun
// modèle/relation ne la consomme).
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('levels');
    }

    public function down(): void
    {
        Schema::create('levels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }
};
