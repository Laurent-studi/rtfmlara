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
 * @property array|null $requirements
 * @property Carbon $created_at
 * 
 * @property Collection|UserAchievement[] $user_achievements
 *
 * @package App\Models
 */
class Trophy extends Model
{
	use HasFactory;

	protected $table = 'trophies';
	public $timestamps = false;

	protected $casts = [
		'requirements' => 'json',
		'criteria' => 'array',
		'points' => 'integer',
		'is_active' => 'boolean',
	];

	protected $fillable = [
		'name',
		'description',
		'icon',
		'level',
		'requirements',
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
}
