<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class OfflineSession
 * 
 * @property int $id
 * @property int|null $user_id
 * @property int|null $quiz_id
 * @property array|null $data
 * @property bool $synced
 * @property Carbon|null $synced_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Quiz|null $quiz
 * @property User|null $user
 *
 * @package App\Models
 */
class OfflineSession extends Model
{
	protected $table = 'offline_sessions';

	protected $casts = [
		'user_id' => 'int',
		'quiz_id' => 'int',
		'data' => 'json',
		'synced' => 'bool',
		'synced_at' => 'datetime'
	];

	protected $fillable = [
		'user_id',
		'quiz_id',
		'data',
		'synced',
		'synced_at'
	];

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
