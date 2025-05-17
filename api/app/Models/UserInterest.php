<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UserInterest
 * 
 * @property int $user_id
 * @property int $interest_id
 * @property float $weight
 * 
 * @property Interest $interest
 * @property User $user
 *
 * @package App\Models
 */
class UserInterest extends Model
{
	protected $table = 'user_interests';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'interest_id' => 'int',
		'weight' => 'float'
	];

	protected $fillable = [
		'weight'
	];

	public function interest()
	{
		return $this->belongsTo(Interest::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
