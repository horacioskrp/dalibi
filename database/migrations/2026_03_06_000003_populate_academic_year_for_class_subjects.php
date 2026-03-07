<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get the active academic year
        $activeYear = DB::table('academic_years')
            ->where('active', true)
            ->orderBy('start_date', 'desc')
            ->first();

        if ($activeYear) {
            // Update all class_subjects with NULL academic_year_id to use the active year
            DB::table('class_subjects')
                ->whereNull('academic_year_id')
                ->update(['academic_year_id' => $activeYear->id]);
        } else {
            // If no active year exists, get the most recent one
            $mostRecent = DB::table('academic_years')
                ->orderBy('start_date', 'desc')
                ->first();

            if ($mostRecent) {
                DB::table('class_subjects')
                    ->whereNull('academic_year_id')
                    ->update(['academic_year_id' => $mostRecent->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('class_subjects')
            ->update(['academic_year_id' => null]);
    }
};
