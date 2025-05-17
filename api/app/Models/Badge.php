<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

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
	protected $table = 'badges';
	public $timestamps = false;

	protected $casts = [
		'requirements' => 'json'
	];

	protected $fillable = [
		'name',
		'description',
		'icon',
		'category',
		'requirements'
	];

	public function user_achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}
}
