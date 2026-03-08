<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluation_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->foreignUuid('class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignUuid('evaluation_type_id')->constrained('evaluation_types')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->double('coefficient')->default(1);
            $table->enum('status', ['scheduled', 'completed'])->default('scheduled');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
        Schema::dropIfExists('evaluation_types');
    }
};
