<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grading_configs', function (Blueprint $table) {
            $table->dropColumn(['term1_weight', 'term2_weight', 'term3_weight']);
        });

        Schema::table('grading_configs', function (Blueprint $table) {
            // null = configuration par défaut de l'école (tous types de classe)
            $table->foreignUuid('classroom_type_id')->nullable()->after('school_id')
                ->constrained('classroom_types')->nullOnDelete();
            // Combinaison Classe (contrôle continu) / Composition (appliquée en phase 2)
            $table->decimal('class_weight', 4, 2)->default(1)->after('default_max_score');
            $table->decimal('comp_weight', 4, 2)->default(1)->after('class_weight');
            // Seuils de mentions : [{ label, min }]
            $table->json('mentions')->nullable()->after('comp_weight');
        });
    }

    public function down(): void
    {
        Schema::table('grading_configs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('classroom_type_id');
            $table->dropColumn(['class_weight', 'comp_weight', 'mentions']);
        });

        Schema::table('grading_configs', function (Blueprint $table) {
            $table->decimal('term1_weight', 4, 2)->default(1.00);
            $table->decimal('term2_weight', 4, 2)->default(1.00);
            $table->decimal('term3_weight', 4, 2)->default(1.00);
        });
    }
};
