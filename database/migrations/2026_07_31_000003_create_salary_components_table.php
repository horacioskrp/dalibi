<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Rubriques de paie configurables : gains (primes…) et retenues (CNSS, avances…).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_components', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type', 20);                        // earning | deduction
            $table->decimal('default_amount', 15, 2)->nullable();
            $table->boolean('is_default')->default(false);     // appliquée à la génération d'un bulletin
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['active', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_components');
    }
};
