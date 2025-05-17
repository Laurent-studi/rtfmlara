<?php

namespace App\Console\Commands;

use App\Models\Tag;
use Illuminate\Console\Command;

class CreateDefaultTags extends Command
{
    /**
     * Le nom et la signature de la commande console.
     *
     * @var string
     */
    protected $signature = 'tags:create-defaults';

    /**
     * La description de la commande console.
     *
     * @var string
     */
    protected $description = 'Crée des tags par défaut pour les quiz';

    /**
     * Exécuter la commande console.
     */
    public function handle()
    {
        $defaultTags = [
            [
                'name' => 'Science',
                'description' => 'Quiz à propos de sujets scientifiques',
                'color' => '#3498db'
            ],
            [
                'name' => 'Histoire',
                'description' => 'Quiz sur des événements historiques',
                'color' => '#e74c3c'
            ],
            [
                'name' => 'Géographie',
                'description' => 'Quiz sur les pays, villes et lieux du monde',
                'color' => '#2ecc71'
            ],
            [
                'name' => 'Littérature',
                'description' => 'Quiz sur des livres, auteurs et mouvements littéraires',
                'color' => '#9b59b6'
            ],
            [
                'name' => 'Cinéma',
                'description' => 'Quiz sur les films, acteurs et réalisateurs',
                'color' => '#f39c12'
            ],
            [
                'name' => 'Musique',
                'description' => 'Quiz sur les artistes, chansons et genres musicaux',
                'color' => '#1abc9c'
            ],
            [
                'name' => 'Sport',
                'description' => 'Quiz sur les sports, athlètes et compétitions',
                'color' => '#d35400'
            ],
            [
                'name' => 'Technologie',
                'description' => 'Quiz sur l\'informatique, la technologie et les innovations',
                'color' => '#34495e'
            ],
            [
                'name' => 'Nourriture',
                'description' => 'Quiz sur la cuisine, les aliments et les plats',
                'color' => '#e67e22'
            ],
            [
                'name' => 'Animaux',
                'description' => 'Quiz sur la faune et les espèces animales',
                'color' => '#27ae60'
            ]
        ];

        $createdCount = 0;
        $existingCount = 0;

        foreach ($defaultTags as $tagData) {
            $existingTag = Tag::where('name', $tagData['name'])->first();
            
            if (!$existingTag) {
                $tag = new Tag();
                $tag->name = $tagData['name'];
                $tag->slug = Tag::createSlug($tagData['name']);
                $tag->description = $tagData['description'];
                $tag->color = $tagData['color'];
                $tag->save();
                
                $createdCount++;
                $this->info("Tag créé: {$tag->name}");
            } else {
                $existingCount++;
                $this->line("Tag déjà existant: {$tagData['name']}");
            }
        }

        $this->info("✅ Création des tags par défaut terminée. Créés: $createdCount, Déjà existants: $existingCount");
        
        return Command::SUCCESS;
    }
} 