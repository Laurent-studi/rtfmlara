<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CustomAvatar
 * 
 * @property int $id
 * @property int|null $user_id
 * @property string $name
 * @property string $image_url
 * @property bool $is_active
 * @property Carbon $created_at
 * 
 * @property User|null $user
 *
 * @package App\Models
 */
class CustomAvatar extends Model
{
	protected $table = 'custom_avatars';
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'user_id',
		'name',
		'image_url',
		'is_active'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
