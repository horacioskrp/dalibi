<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('installments', function (Blueprint $table): void {
            $table->date('due_date')->nullable()->after('amount');
            $table->foreignUuid('academic_period_id')
                ->nullable()
                ->after('due_date')
                ->constrained('academic_periods')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('installments', function (Blueprint $table): void {
            $table->dropForeign(['academic_period_id']);
            $table->dropColumn(['due_date', 'academic_period_id']);
        });
    }
};
