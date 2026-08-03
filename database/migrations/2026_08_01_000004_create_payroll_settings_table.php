<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Réglages de paie (singleton). Phase 2A : règle d'ancienneté simple
// (désactivée par défaut, donc non intrusive).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('seniority_enabled')->default(false);
            $table->decimal('seniority_rate_per_year', 5, 2)->default(0); // % du base / an
            $table->decimal('seniority_cap_percent', 5, 2)->default(0);   // plafond en %
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_settings');
    }
};
