<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            // Sous-matière : rattachement à une matière parente (ex. « Dictée » sous « Français »)
            $table->foreignUuid('parent_id')->nullable()->after('id')->constrained('subjects')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
        });
    }
};
