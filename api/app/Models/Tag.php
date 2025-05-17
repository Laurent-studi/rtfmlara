<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
    ];

    /**
     * Obtenir les quiz associés à ce tag.
     */
    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'quiz_tag');
    }

    /**
     * Créer un slug à partir du nom du tag.
     *
     * @param string $name
     * @return string
     */
    public static function createSlug(string $name): string
    {
        // Convertir en minuscules et remplacer les espaces par des tirets
        $slug = strtolower(str_replace(' ', '-', $name));
        
        // Supprimer les caractères spéciaux
        $slug = preg_replace('/[^A-Za-z0-9\-]/', '', $slug);
        
        // S'assurer que le slug est unique
        $count = 1;
        $originalSlug = $slug;
        
        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }
        
        return $slug;
    }
} 