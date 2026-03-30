<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('type', ['INCOME', 'EXPENSE']);
            $table->decimal('amount', 15, 2);
            $table->string('description');
            $table->enum('reference_type', ['PAYMENT', 'SCHOLARSHIP', 'EXPENSE', 'CANCELLATION']);
            $table->string('reference_id', 36)->nullable();   // UUID source
            $table->foreignUuid('cash_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();

            $table->index(['type', 'transaction_date']);
            $table->index('cash_account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_transactions');
    }
};
