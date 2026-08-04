<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Phase 2B : cotisation CNSS (part salariale + patronale, plafond) et impôt sur
// les traitements et salaires (ITS, barème progressif). Désactivés par défaut
// (opt-in) : aucun impact tant que l'école ne les active pas.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_settings', function (Blueprint $table) {
            $table->boolean('cnss_enabled')->default(false)->after('seniority_cap_percent');
            $table->decimal('cnss_employee_rate', 5, 2)->default(4);    // % à la charge du salarié
            $table->decimal('cnss_employer_rate', 5, 2)->default(17.5); // % à la charge de l'employeur
            $table->decimal('cnss_ceiling', 15, 2)->default(0);         // plafond mensuel (0 = sans plafond)
            $table->boolean('its_enabled')->default(false);
            $table->json('its_brackets')->nullable();                   // barème progressif [{up_to, rate}]
        });
    }

    public function down(): void
    {
        Schema::table('payroll_settings', function (Blueprint $table) {
            $table->dropColumn(['cnss_enabled', 'cnss_employee_rate', 'cnss_employer_rate', 'cnss_ceiling', 'its_enabled', 'its_brackets']);
        });
    }
};
