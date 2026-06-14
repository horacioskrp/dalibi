<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fee_structures', function (Blueprint $table): void {
            $table->unique(
                ['academic_year_id', 'fee_category_id', 'class_id'],
                'fee_structures_year_category_class_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('fee_structures', function (Blueprint $table): void {
            $table->dropUnique('fee_structures_year_category_class_unique');
        });
    }
};
