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
 * @property array|null $requirements
 * @property Carbon $created_at
 * 
 * @property Collection|UserAchievement[] $user_achievements
 *
 * @package App\Models
 */
class Badge extends Model
{
	use HasFactory;

	protected $table = 'badges';
	public $timestamps = false;

	protected $casts = [
		'requirements' => 'json',
		'criteria' => 'array',
		'is_active' => 'boolean',
	];

	protected $fillable = [
		'name',
		'description',
		'icon',
		'category',
		'requirements',
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
}
