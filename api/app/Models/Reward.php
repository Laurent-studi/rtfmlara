<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Reward
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property int $points
 * @property string $type
 * @property Carbon $created_at
 * 
 * @property Collection|UserAchievement[] $user_achievements
 *
 * @package App\Models
 */
class Reward extends Model
{
	protected $table = 'rewards';
	public $timestamps = false;

	protected $casts = [
		'points' => 'int'
	];

	protected $fillable = [
		'name',
		'description',
		'icon',
		'points',
		'type'
	];

	public function user_achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}
}
