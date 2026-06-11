<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->foreignUuid('evaluation_type_id')->constrained('evaluation_types')->onDelete('cascade');
            $table->string('name');                        // "Devoir 1", "Examen du trimestre"
            $table->text('description')->nullable();
            $table->decimal('coefficient', 4, 2)->default(1); // poids de cet examen dans la moyenne matière
            $table->decimal('max_score', 5, 2)->default(20);  // barème (20 ou 100)
            $table->date('date')->nullable();              // date indicative commune
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_templates');
    }
};
