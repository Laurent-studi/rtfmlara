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
            $table->string('name', 100);
            $table->string('description')->nullable();
            $table->string('primary_color', 20);
            $table->string('secondary_color', 20);
            $table->string('accent_color', 20)->nullable();
            $table->string('text_color', 20);
            $table->string('background_color', 20);
            $table->string('card_color', 20)->nullable();
            $table->boolean('is_dark')->default(false);
            $table->string('font_family', 100)->nullable();
            $table->integer('border_radius')->default(8);
            $table->string('css_variables')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_user_selectable')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // Table pivot pour les thèmes des utilisateurs
        Schema::create('user_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('theme_id')->constrained()->onDelete('cascade');
            $table->timestamp('applied_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_themes');
        Schema::dropIfExists('themes');
    }
};
