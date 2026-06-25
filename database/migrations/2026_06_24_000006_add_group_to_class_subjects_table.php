<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_subjects', function (Blueprint $table) {
            // obligatoire | facultatif — pour grouper les matières sur le bulletin
            $table->string('group')->default('obligatoire')->after('coefficient');
        });
    }

    public function down(): void
    {
        Schema::table('class_subjects', function (Blueprint $table) {
            $table->dropColumn('group');
        });
    }
};
