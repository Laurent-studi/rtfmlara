<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

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
	protected $table = 'trophies';
	public $timestamps = false;

	protected $casts = [
		'requirements' => 'json'
	];

	protected $fillable = [
		'name',
		'description',
		'icon',
		'level',
		'requirements'
	];

	public function user_achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}
}
