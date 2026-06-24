<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bulletin_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignUuid('classroom_type_id')->nullable()->constrained('classroom_types')->nullOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(false);
            $table->json('columns');   // colonnes ordonnées : { key, label, width, type, source }
            $table->json('options');   // { show_class_stats, nb_text, signataires... }
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulletin_templates');
    }
};
