<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('schoolings');
    }

    public function down(): void
    {
        Schema::create('schoolings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_id')->constrained('classes')->onDelete('cascade');
            $table->double('inscription_fee')->default(0);
            $table->double('school_fee')->default(0);
            $table->timestamps();
        });
    }
};
