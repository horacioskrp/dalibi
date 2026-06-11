<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Vider les anciennes évaluations (données de dev uniquement)
        DB::table('evaluations')->truncate();

        Schema::table('evaluations', function (Blueprint $table) {
            // Supprimer les anciennes colonnes
            $table->dropForeign(['academic_period_id']);
            $table->dropForeign(['class_id']);
            $table->dropForeign(['evaluation_type_id']);
            $table->dropColumn(['academic_period_id', 'class_id', 'evaluation_type_id', 'name', 'description', 'coefficient']);

            // Ajouter les nouvelles colonnes
            $table->foreignUuid('evaluation_template_id')
                ->after('id')
                ->constrained('evaluation_templates')
                ->onDelete('cascade');

            $table->foreignUuid('class_subject_id')
                ->after('evaluation_template_id')
                ->constrained('class_subjects')
                ->onDelete('cascade');

            $table->unique(['evaluation_template_id', 'class_subject_id']);
        });
    }

    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropUnique(['evaluation_template_id', 'class_subject_id']);
            $table->dropForeign(['evaluation_template_id']);
            $table->dropForeign(['class_subject_id']);
            $table->dropColumn(['evaluation_template_id', 'class_subject_id']);

            $table->foreignUuid('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->foreignUuid('class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignUuid('evaluation_type_id')->constrained('evaluation_types')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('coefficient')->default(1);
        });
    }
};
