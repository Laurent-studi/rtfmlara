<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Class UserAchievement
 * 
 * @property int $id
 * @property int|null $user_id
 * @property int|null $badge_id
 * @property int|null $reward_id
 * @property int|null $trophy_id
 * @property Carbon $earned_at
 * 
 * @property Badge|null $badge
 * @property Reward|null $reward
 * @property Trophy|null $trophy
 * @property User|null $user
 *
 * @package App\Models
 */
class UserAchievement extends Model
{
	use HasFactory;

	protected $table = 'user_achievements';
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'badge_id' => 'int',
		'reward_id' => 'int',
		'trophy_id' => 'int',
		'earned_at' => 'datetime',
		'data' => 'array',
	];

	protected $fillable = [
		'user_id',
		'badge_id',
		'reward_id',
		'trophy_id',
		'earned_at',
		'data',
	];

	public function badge()
	{
		return $this->belongsTo(Badge::class);
	}

	public function reward()
	{
		return $this->belongsTo(Reward::class);
	}

	public function trophy()
	{
		return $this->belongsTo(Trophy::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	/**
	 * Get the owning achievable model.
	 */
	public function achievable()
	{
		return $this->morphTo();
	}
}
