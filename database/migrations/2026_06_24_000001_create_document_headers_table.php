<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_headers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('school_id')->unique()->constrained('schools')->cascadeOnDelete();
            $table->json('layout');     // { width, height, elements: [...] }
            $table->json('watermark');  // { enabled, type, text, image_path, opacity, size, rotation, color }
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_headers');
    }
};
