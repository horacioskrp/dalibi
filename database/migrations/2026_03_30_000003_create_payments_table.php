<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 30)->default('CASH');
            // CASH | MOBILE_MONEY | BANK_TRANSFER | CHEQUE
            $table->string('reference_number', 100)->nullable();
            $table->string('paid_by', 150)->nullable();
            $table->date('paid_at');
            $table->text('notes')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (payment_method IN ('CASH','MOBILE_MONEY','BANK_TRANSFER','CHEQUE'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
