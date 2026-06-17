<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('official_exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('school_id')->nullable()->constrained('schools')->nullOnDelete();
            $table->string('type');                 // cepd | bepc | bac
            $table->string('name');
            $table->integer('year');
            $table->string('session')->default('normale'); // normale | rattrapage
            $table->date('exam_date')->nullable();
            $table->string('center')->nullable();   // centre d'examen
            $table->string('status')->default('ouvert'); // ouvert | clos | termine
            $table->timestamps();

            $table->index(['type', 'year']);
        });

        Schema::create('official_exam_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('official_exam_id')->constrained('official_exams')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('registration_number')->nullable(); // numéro de table
            $table->string('serie')->nullable();               // série BAC (A4, C, D…)
            $table->string('status')->default('inscrit');      // inscrit | admis | echoue | absent
            $table->decimal('average', 5, 2)->nullable();      // moyenne obtenue
            $table->string('mention')->nullable();             // passable | assez_bien | bien | tres_bien
            $table->timestamps();

            $table->unique(['official_exam_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('official_exam_registrations');
        Schema::dropIfExists('official_exams');
    }
};
