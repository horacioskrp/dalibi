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
        Schema::table('student_information', function (Blueprint $table) {
            $table->foreignUuid('student_id')
                ->nullable()
                ->unique()
                ->after('id')
                ->constrained('students')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_information', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropUnique('student_information_student_id_unique');
            $table->dropColumn('student_id');
        });
    }
};
