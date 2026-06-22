<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color')->default('#64748b'); // slate-500
            $table->timestamps();
        });

        Schema::create('archived_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('autre');

            // Fichier (disque privé "secure")
            $table->string('path');
            $table->string('disk')->default('local');
            $table->string('original_name')->nullable();
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size')->default(0);

            // Liaison polymorphe optionnelle (élève, classe…)
            $table->string('documentable_type')->nullable();
            $table->uuid('documentable_id')->nullable();

            $table->date('retention_until')->nullable();

            $table->foreignUuid('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('archived_at');
            $table->index(['documentable_type', 'documentable_id']);
        });

        Schema::create('archived_document_tag', function (Blueprint $table) {
            $table->foreignUuid('archived_document_id')->constrained('archived_documents')->cascadeOnDelete();
            $table->foreignUuid('document_tag_id')->constrained('document_tags')->cascadeOnDelete();
            $table->primary(['archived_document_id', 'document_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archived_document_tag');
        Schema::dropIfExists('archived_documents');
        Schema::dropIfExists('document_tags');
    }
};
