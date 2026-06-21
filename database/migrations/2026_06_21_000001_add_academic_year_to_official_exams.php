<?php

use App\Models\AcademicYear;
use App\Models\OfficialExam;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('official_exams', function (Blueprint $table) {
            $table->foreignUuid('academic_year_id')->nullable()->after('school_id')
                ->constrained('academic_years')->nullOnDelete();
        });

        // Rattache les examens existants à l'année active (best-effort)
        $activeYearId = AcademicYear::where('active', true)->value('id');
        if ($activeYearId) {
            OfficialExam::whereNull('academic_year_id')->update(['academic_year_id' => $activeYearId]);
        }
    }

    public function down(): void
    {
        Schema::table('official_exams', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_year_id');
        });
    }
};
