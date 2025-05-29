<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ThemeSeeder extends Seeder
{
    /**
     * Exécute le seeder.
     */
    public function run(): void
    {
        // Désactiver temporairement les vérifications de clés étrangères
        Schema::disableForeignKeyConstraints();
        
        // Supprimer les thèmes existants au lieu d'utiliser truncate
        Theme::query()->delete();
        
        // Réactiver les vérifications de clés étrangères
        Schema::enableForeignKeyConstraints();
        
        // Tableau des thèmes à créer
        $themesData = [
            [
                'name' => 'Sombre',
                'code' => 'dark',
                'filename' => 'dark.css',
                'description' => 'Thème sombre par défaut',
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Clair',
                'code' => 'light',
                'filename' => 'light.css',
                'description' => 'Thème clair classique',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Élégant',
                'code' => 'elegant',
                'filename' => 'elegant.css',
                'description' => 'Thème élégant et sobre',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Néon',
                'code' => 'neon',
                'filename' => 'neon.css',
                'description' => 'Thème coloré et vibrant',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Pastel',
                'code' => 'pastel',
                'filename' => 'pastel.css',
                'description' => 'Thème aux couleurs douces et pastel',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Fun',
                'code' => 'fun',
                'filename' => 'fun.css',
                'description' => 'Thème amusant et coloré',
                'is_default' => false,
                'is_active' => true,
            ],
        ];
        
        // Créer les thèmes
        foreach ($themesData as $themeData) {
            // Vérifier si le fichier CSS existe dans le dossier public
            $cssPath = public_path('css/themes/' . $themeData['filename']);
            
            // Si le fichier existe ou si on est en environnement de développement, créer le thème
            if (File::exists($cssPath) || app()->environment('local', 'development', 'testing')) {
                Theme::create($themeData);
            } else {
                $this->command->info('Le fichier ' . $themeData['filename'] . ' n\'existe pas.');
            }
        }
        
        $this->command->info('Thèmes créés avec succès!');
    }
} 