<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_periods', function (Blueprint $table) {
            // Période scopée à un type de classe (null = applicable à toutes les classes)
            $table->foreignUuid('class_type_id')->nullable()->after('academic_year_id')
                ->constrained('classroom_types')->nullOnDelete();
            // Poids de la période dans la moyenne annuelle
            $table->decimal('weight', 5, 2)->default(1)->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('academic_periods', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_type_id');
            $table->dropColumn('weight');
        });
    }
};
