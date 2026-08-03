<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Rattache l'employé à une grille : le salaire de base en découle.
// base_salary est conservé comme repli pour un employé pas encore classé.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->foreignUuid('salary_grade_id')->nullable()->after('contract_type')
                ->constrained('salary_grades')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('salary_grade_id');
        });
    }
};
