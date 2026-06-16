<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('school_id')->nullable()->constrained('schools')->nullOnDelete();
            $table->string('category');                 // certificat | attestation | bulletin
            $table->string('type');                     // certificat_scolarite, attestation_frequentation, ...
            $table->string('name');
            $table->string('description')->nullable();
            $table->longText('content')->nullable();    // HTML avec variables {{ ... }}
            $table->boolean('header_enabled')->default(true);
            $table->boolean('footer_enabled')->default(true);
            $table->boolean('show_signature')->default(true);
            $table->string('signatory_title')->nullable(); // « Le Directeur »
            $table->string('orientation')->default('portrait'); // portrait | landscape
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'type']);
        });

        Schema::create('document_issuances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('template_id')->constrained('document_templates')->cascadeOnDelete();
            $table->foreignUuid('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('reference_number')->unique();   // numéro d'enregistrement officiel
            $table->foreignUuid('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('payload')->nullable();            // snapshot des données au moment de l'émission
            $table->timestamp('issued_at');
            $table->timestamps();

            $table->index('reference_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_issuances');
        Schema::dropIfExists('document_templates');
    }
};
