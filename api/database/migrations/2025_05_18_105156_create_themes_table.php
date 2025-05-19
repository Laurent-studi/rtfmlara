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
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // par exemple: theme-dark, theme-light
            $table->string('description')->nullable();
            $table->string('primary_color', 20);
            $table->string('secondary_color', 20);
            $table->string('background_color', 20);
            $table->string('text_color', 20);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_premium')->default(false);
            $table->timestamps();
        });

        // Table pour les préférences utilisateur
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('theme_id')->nullable()->constrained()->onDelete('set null');
            $table->json('other_preferences')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('themes');
    }
};
