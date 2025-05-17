<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Challenge
 * 
 * @property int $id
 * @property int|null $challenger_id
 * @property int|null $challenged_id
 * @property int|null $quiz_id
 * @property string $status
 * @property int|null $winner_id
 * @property Carbon $created_at
 * 
 * @property User|null $user
 * @property Quiz|null $quiz
 *
 * @package App\Models
 */
class Challenge extends Model
{
	protected $table = 'challenges';
	public $timestamps = false;

	protected $casts = [
		'challenger_id' => 'int',
		'challenged_id' => 'int',
		'quiz_id' => 'int',
		'winner_id' => 'int'
	];

	protected $fillable = [
		'challenger_id',
		'challenged_id',
		'quiz_id',
		'status',
		'winner_id'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'winner_id');
	}

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}
}
