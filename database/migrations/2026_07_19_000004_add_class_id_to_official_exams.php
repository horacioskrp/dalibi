<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('official_exams', function (Blueprint $table) {
            // Classe à laquelle l'examen officiel est rattaché (ex. CM2 → CEPD).
            $table->foreignUuid('class_id')->nullable()->after('academic_year_id')
                ->constrained('classes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('official_exams', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_id');
        });
    }
};
