<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Système de périodes par type de classe (trimestre / semestre)
        Schema::table('classroom_types', function (Blueprint $table) {
            $table->string('period_system')->default('trimestre')->after('description');
        });

        // Association école ↔ types de classe proposés (pivot : clé composite, pas d'id)
        Schema::create('class_type_school', function (Blueprint $table) {
            $table->foreignUuid('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignUuid('classroom_type_id')->constrained('classroom_types')->cascadeOnDelete();

            $table->primary(['school_id', 'classroom_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_type_school');
        Schema::table('classroom_types', function (Blueprint $table) {
            $table->dropColumn('period_system');
        });
    }
};
