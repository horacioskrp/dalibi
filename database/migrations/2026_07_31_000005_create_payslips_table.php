<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bulletin de paie d'un employé pour une période. Les lignes (rubriques) sont
// figées dans un snapshot JSON (payload), comme les bulletins scolaires.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pay_run_id')->constrained('pay_runs')->cascadeOnDelete();
            $table->foreignUuid('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->string('reference');
            $table->decimal('gross', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('net', 15, 2)->default(0);
            $table->json('payload');                            // snapshot : employé + lignes
            $table->uuid('accounting_transaction_id')->nullable(); // transaction EXPENSE liée (au paiement)
            $table->timestamps();

            $table->index('pay_run_id');
            $table->index('employee_profile_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
