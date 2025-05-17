<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Classe abstraite Achievement
 * 
 * Sert de base pour les modèles Badge et Trophy
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property string $category
 * @property array|null $criteria
 * @property Carbon $created_at
 */
abstract class Achievement extends Model
{
    use HasFactory;

    /**
     * Indique si le modèle utilise les timestamps.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'criteria' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'icon',
        'code',
        'image_url',
        'criteria',
        'is_active',
    ];

    /**
     * Obtenir les utilisateurs qui ont obtenu cet achievement.
     */
    public function users(): MorphToMany
    {
        return $this->morphToMany(User::class, 'achievable', 'user_achievements')
            ->withPivot('earned_at', 'data');
    }

    /**
     * Vérifie si l'achievement est actif.
     * 
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Vérifie si un utilisateur a obtenu cet achievement.
     * 
     * @param User $user
     * @return bool
     */
    public function isEarnedBy(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Obtenir la date à laquelle un utilisateur a obtenu cet achievement.
     * 
     * @param User $user
     * @return Carbon|null
     */
    public function getEarnedAtByUser(User $user): ?Carbon
    {
        $pivot = $this->users()->where('user_id', $user->id)->first()?->pivot;
        
        return $pivot ? $pivot->earned_at : null;
    }
} 