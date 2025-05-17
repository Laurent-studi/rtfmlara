<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Class Trophy
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property string $level
 * @property array|null $criteria
 * @property int $points
 * @property Carbon $created_at
 * 
 * @property Collection|UserAchievement[] $user_achievements
 *
 * @package App\Models
 */
class Trophy extends Achievement
{
	use HasFactory;

	protected $table = 'trophies';
	public $timestamps = false;

	/**
	 * Les attributs qui doivent être convertis.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'criteria' => 'array',
		'points' => 'integer',
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
		'level',
		'code',
		'image_url',
		'criteria',
		'points',
		'is_active',
	];

	public function user_achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}

	/**
	 * Get the users who earned this trophy.
	 */
	public function users()
	{
		return $this->morphToMany(User::class, 'achievable', 'user_achievements')
			->withPivot('earned_at', 'data');
	}

	/**
	 * Obtenir les points associés à ce trophée.
	 * 
	 * @return int
	 */
	public function getPoints(): int
	{
		return $this->points;
	}

	/**
	 * Méthode spécifique pour vérifier les critères d'obtention du trophée
	 * 
	 * @param User $user
	 * @return bool
	 */
	public function checkCriteria(User $user): bool
	{
		// Logique spécifique aux trophées
		// À implémenter selon les critères d'obtention
		return false;
	}
}
