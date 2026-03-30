<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->string('label');
            $table->string('type', 20)->default('FEE'); // FEE | DISCOUNT
            $table->decimal('amount', 12, 2);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::statement("ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_type_check CHECK (type IN ('FEE','DISCOUNT'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
