<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Statut académique de l'inscription, distinct du statut de paiement (status).
     */
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->string('academic_status')->default('en_cours')->after('status');
            $table->string('status_reason')->nullable()->after('academic_status');
            $table->timestamp('status_changed_at')->nullable()->after('status_reason');
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn(['academic_status', 'status_reason', 'status_changed_at']);
        });
    }
};
