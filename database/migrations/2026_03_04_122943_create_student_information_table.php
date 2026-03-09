<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_information', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('birth_certificate_number')->nullable()->after('place_of_birth');
            $table->date('birth_certificate_issue_date')->nullable()->after('birth_certificate_number');
            $table->string('birth_certificate_issue_place')->nullable()->after('birth_certificate_issue_date');
            $table->enum('admission_type', ['new', 'transfer', 're_admission'])->default('new')->after('nationality');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_information');
    }
};
