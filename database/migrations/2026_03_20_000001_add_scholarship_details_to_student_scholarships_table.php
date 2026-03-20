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
        Schema::table('student_scholarships', function (Blueprint $table) {
            $table->integer('number_of_year')->nullable()->after('academic_year_id');
            $table->date('start_date')->nullable()->after('number_of_year');
            $table->date('end_date')->nullable()->after('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_scholarships', function (Blueprint $table) {
            $table->dropColumn(['number_of_year', 'start_date', 'end_date']);
        });
    }
};
