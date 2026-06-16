<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Demandes de permission (créée en premier car attendance_records y fait référence)
        Schema::create('absence_permissions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('reason', ['medical', 'familial', 'autre'])->default('autre');
            $table->text('description');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('review_comment')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // Restructuration de la table attendances existante
        Schema::drop('attendances');

        Schema::create('attendances', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignUuid('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->foreignUuid('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date');
            $table->enum('session', ['matin', 'apres-midi', 'journee'])->default('journee');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['class_id', 'date', 'session']);
        });

        Schema::create('attendance_records', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('attendance_id')->constrained('attendances')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('present');
            $table->foreignUuid('permission_id')->nullable()->constrained('absence_permissions')->nullOnDelete();
            $table->unsignedSmallInteger('minutes_late')->nullable();
            $table->string('comment', 300)->nullable();
            $table->timestamps();

            $table->unique(['attendance_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('absence_permissions');
    }
};
