<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            // Monnaie de l'établissement (code ISO, ex. XOF pour le FCFA) — distincte
            // de « devise » qui est le slogan/l'exergue de l'école.
            $table->string('currency', 3)->default('XOF')->after('devise');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
};
