<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_scholarships', function (Blueprint $table) {
            $table->unique(['student_id', 'scholarship_id', 'academic_year_id'], 'student_scholarships_unique');
        });
    }

    public function down(): void
    {
        Schema::table('student_scholarships', function (Blueprint $table) {
            $table->dropUnique('student_scholarships_unique');
        });
    }
};
