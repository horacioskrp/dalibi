<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('enrollment_id')->constrained('enrollments')->cascadeOnDelete();
            $table->string('invoice_number', 50)->unique();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('amount_remaining', 12, 2)->default(0);
            $table->string('status', 20)->default('ISSUED');
            // ISSUED | PARTIALLY_PAID | PAID | CANCELLED
            $table->date('issued_at')->nullable();
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('ISSUED','PARTIALLY_PAID','PAID','CANCELLED'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
