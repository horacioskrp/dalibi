<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_medical_infos', function (Blueprint $table) {
            $table->text('allergies')->nullable()->change();
            $table->text('vaccinations')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('student_medical_infos', function (Blueprint $table) {
            $table->string('allergies')->nullable()->change();
            $table->string('vaccinations')->nullable()->change();
        });
    }
};
