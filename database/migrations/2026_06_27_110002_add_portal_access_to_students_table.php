<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('password')->nullable()->after('email');
            $table->boolean('portal_active')->default(false)->after('password');
            $table->timestamp('email_verified_at')->nullable()->after('portal_active');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['password', 'portal_active', 'email_verified_at']);
        });
    }
};
