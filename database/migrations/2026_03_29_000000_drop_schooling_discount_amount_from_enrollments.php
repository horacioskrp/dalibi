<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table): void {
            $table->dropColumn(['schooling_id', 'discount_percentage', 'amount_to_pay']);
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table): void {
            $table->foreignUuid('schooling_id')->nullable()->constrained('schoolings')->nullOnDelete();
            $table->decimal('discount_percentage', 5, 2)->default(0)->after('schooling_id');
            $table->decimal('amount_to_pay', 10, 2)->nullable()->after('discount_percentage');
        });
    }
};
