<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catégorie structurée des dépenses (nullable : les entrées PAYMENT/SCHOLARSHIP
// /CANCELLATION n'en ont pas). Clé issue de App\Constants\ExpenseCategories.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounting_transactions', function (Blueprint $table) {
            $table->string('category', 40)->nullable()->after('reference_type');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::table('accounting_transactions', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }
};
