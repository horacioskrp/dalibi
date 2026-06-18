<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->foreignUuid('class_type_id')->nullable()->after('evaluation_type_id')
                ->constrained('classroom_types')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_type_id');
        });
    }
};
