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
            $table->decimal('amount', 10, 2)->after('academic_year_id');
            $table->text('notes')->nullable()->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_scholarships', function (Blueprint $table) {
            $table->dropColumn(['amount', 'notes']);
        });
    }
};
