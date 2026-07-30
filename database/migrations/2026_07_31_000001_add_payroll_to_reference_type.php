<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Étend l'enum accounting_transactions.reference_type avec 'PAYROLL' pour les
// bases déjà migrées (prod PostgreSQL). Sur SQLite (tests), la table est créée
// à neuf avec l'enum déjà à jour, donc rien à faire. Idempotent.
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE accounting_transactions DROP CONSTRAINT IF EXISTS accounting_transactions_reference_type_check');
        DB::statement("ALTER TABLE accounting_transactions ADD CONSTRAINT accounting_transactions_reference_type_check CHECK (reference_type::text = ANY (ARRAY['PAYMENT','SCHOLARSHIP','EXPENSE','CANCELLATION','PAYROLL']::text[]))");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE accounting_transactions DROP CONSTRAINT IF EXISTS accounting_transactions_reference_type_check');
        DB::statement("ALTER TABLE accounting_transactions ADD CONSTRAINT accounting_transactions_reference_type_check CHECK (reference_type::text = ANY (ARRAY['PAYMENT','SCHOLARSHIP','EXPENSE','CANCELLATION']::text[]))");
    }
};
