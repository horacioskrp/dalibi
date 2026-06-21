<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('filename');
            $table->string('path');
            $table->string('disk')->default('local');   // local | s3
            $table->string('format');                    // json | sql
            $table->unsignedBigInteger('size')->default(0);
            $table->string('status')->default('completed'); // completed | failed
            $table->text('error')->nullable();
            $table->boolean('scheduled')->default(false); // déclenché par le planificateur
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('backup_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backups');
        Schema::dropIfExists('backup_settings');
    }
};
