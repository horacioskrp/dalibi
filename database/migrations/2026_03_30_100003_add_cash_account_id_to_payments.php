<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('cash_account_id')
                  ->nullable()
                  ->after('payment_method')
                  ->constrained()
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\CashAccount::class);
            $table->dropColumn('cash_account_id');
        });
    }
};
