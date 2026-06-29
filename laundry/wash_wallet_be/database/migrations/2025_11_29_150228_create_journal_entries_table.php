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
        Schema::create('journal_entries', function (Blueprint $table) {
           $table->id();
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');        
            $table->string('transaction_number')->unique();$table->date('date');
            $table->text('description')->nullable();            
            $table->nullableMorphs('reference');             
            $table->boolean('is_manual')->default(false);        
            $table->decimal('total_amount', 15, 2)->default(0);        
            $table->timestamps();
            $table->softDeletes();
            $table->index(['outlet_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
