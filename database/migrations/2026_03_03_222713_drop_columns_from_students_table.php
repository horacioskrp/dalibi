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
        Schema::table('students', function (Blueprint $table) {
            // Supprimer FK et index uniques avant les colonnes (requis par SQLite)
            $table->dropForeign(['class_id']);
            $table->dropUnique('students_registration_number_unique');
            $table->dropColumn(['class_id', 'registration_number', 'enrollment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignUuid('class_id')->nullable()->constrained('classrooms')->onDelete('set null');
            $table->string('registration_number')->nullable()->unique();
            $table->date('enrollment_date')->nullable();
        });
    }
};
