<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_types', function (Blueprint $table) {
            // continu = contrôle continu (note de classe) ; composition = examen de composition
            $table->string('category')->default('continu')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_types', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
