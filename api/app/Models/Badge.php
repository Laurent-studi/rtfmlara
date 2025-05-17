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
 * Class Badge
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property string $category
 * @property array|null $criteria
 * @property Carbon $created_at
 * 
 * @property Collection|UserAchievement[] $user_achievements
 *
 * @package App\Models
 */
class Badge extends Achievement
{
	use HasFactory;

	protected $table = 'badges';
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
		'category',
		'code',
		'image_url',
		'criteria',
		'is_active',
	];

	public function user_achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}

	/**
	 * Get the users who earned this badge.
	 */
	public function users()
	{
		return $this->morphToMany(User::class, 'achievable', 'user_achievements')
			->withPivot('earned_at', 'data');
	}

	/**
	 * Méthode spécifique pour vérifier les critères d'obtention du badge
	 * 
	 * @param User $user
	 * @return bool
	 */
	public function checkCriteria(User $user): bool
	{
		// Logique spécifique aux badges
		// À implémenter selon les critères d'obtention
		return false;
	}
}
