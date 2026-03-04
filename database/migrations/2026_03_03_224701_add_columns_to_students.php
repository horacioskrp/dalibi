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
        Schema::table('students', function (Blueprint $table) {
            $table->string('matricule')->nullable()->unique()->after('id');
            $table->string('firstname')->after('matricule');
            $table->string('lastname')->after('firstname');
            $table->enum('gender', ['male', 'female'])->after('lastname');
            $table->date('birth_date')->after('gender');
            $table->string('place_of_birth')->nullable()->after('birth_date');
            $table->string('nationality')->nullable()->after('place_of_birth');
            $table->string('address')->nullable()->after('nationality');
            $table->string('city')->nullable()->after('address');
            $table->string('phone')->nullable()->after('city');
            $table->string('email')->nullable()->unique()->after('phone');
            $table->string('profile_photo')->nullable()->after('email');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'matricule', 'firstname', 'lastname', 'birth_date',
                'gender', 'place_of_birth', 'birth_certificate_number', 'birth_certificate_issue_date', 'birth_certificate_issue_place', 'nationality', 'admission_type', 'address', 'city',
                'phone', 'email', 'profile_photo']);
        });
    }
};
