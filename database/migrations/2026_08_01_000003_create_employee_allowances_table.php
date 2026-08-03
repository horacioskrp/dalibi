<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Variables supplémentaires TRACÉES par employé : primes/compléments et retenues
// récurrents, empilés sur le salaire de grille. Chaque ligne conserve son motif
// et son auteur (traçabilité).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_allowances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->string('type', 20);                 // earning | deduction
            $table->string('label');
            $table->string('mode', 20)->default('fixed'); // fixed | percent_base
            $table->decimal('amount', 15, 2);           // montant fixe, ou % du base si percent_base
            $table->string('reason')->nullable();       // motif
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->boolean('active')->default(true);
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['employee_profile_id', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_allowances');
    }
};
