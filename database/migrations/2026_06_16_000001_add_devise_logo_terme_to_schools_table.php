<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('devise', 500)->nullable()->after('logo');
            $table->string('terme', 255)->default('République Togolaise')->after('devise');
        });

        // logo passe de string (URL) à string (path fichier) — aucun changement de type nécessaire
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn(['devise', 'terme']);
        });
    }
};
