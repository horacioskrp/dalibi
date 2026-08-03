<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Grille salariale : chaque catégorie/échelon porte un montant direct (FCFA).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_grades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');                    // ex. « Enseignant — Catégorie B, échelon 2 »
            $table->string('category')->nullable();    // ex. « B »
            $table->unsignedInteger('echelon')->nullable();
            $table->decimal('base_amount', 15, 2);     // salaire de base mensuel
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_grades');
    }
};
