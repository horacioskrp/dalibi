<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Profil RH d'un utilisateur (1-1 avec users). Optionnel : tout utilisateur
// n'est pas forcément un employé salarié.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('employee_number')->nullable()->unique();
            $table->string('job_title');                        // poste
            $table->string('department')->nullable();           // service / département
            $table->string('contract_type', 20)->default('CDI');
            $table->date('hire_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('base_salary', 15, 2)->default(0);  // salaire de base mensuel
            $table->string('payment_method', 20)->default('CASH'); // CASH|MOBILE_MONEY|BANK_TRANSFER|CHEQUE
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('momo_number')->nullable();
            $table->string('cnss_number')->nullable();          // n° sécurité sociale
            $table->string('status', 20)->default('active');    // active|suspended|terminated
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
