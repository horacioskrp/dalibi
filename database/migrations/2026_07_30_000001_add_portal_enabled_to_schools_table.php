<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Interrupteur global de l'espace parents/élèves : quand il est désactivé,
// l'API du portail (connexion + toutes les routes) est inaccessible.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->boolean('portal_enabled')->default(true)->after('active');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('portal_enabled');
        });
    }
};
