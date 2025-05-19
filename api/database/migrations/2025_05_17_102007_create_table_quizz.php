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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100);
            $table->text('description')->nullable();
            $table->foreignId('creator_id')->nullable()->constrained('users');
            $table->string('category', 50)->nullable();
            $table->integer('time_per_question')->default(30);
            $table->boolean('multiple_answers')->default(false);
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->string('code', 6)->unique();
            $table->string('join_code', 6)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
