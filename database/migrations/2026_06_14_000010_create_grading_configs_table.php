<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grading_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('name', 150);
            $table->boolean('is_active')->default(false);
            $table->decimal('passing_score', 5, 2)->default(10.00);
            $table->decimal('default_max_score', 5, 2)->default(20.00);
            $table->decimal('term1_weight', 4, 2)->default(1.00);
            $table->decimal('term2_weight', 4, 2)->default(1.00);
            $table->decimal('term3_weight', 4, 2)->default(1.00);
            $table->unsignedTinyInteger('round_precision')->default(2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grading_configs');
    }
};
