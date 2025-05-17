<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class QuizSession
 * 
 * @property int $id
 * @property int|null $quiz_id
 * @property Carbon $started_at
 * @property Carbon|null $ended_at
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Quiz|null $quiz
 * @property Collection|Participant[] $participants
 *
 * @package App\Models
 */
class QuizSession extends Model
{
	protected $table = 'quiz_sessions';

	protected $casts = [
		'quiz_id' => 'int',
		'started_at' => 'datetime',
		'ended_at' => 'datetime'
	];

	protected $fillable = [
		'quiz_id',
		'started_at',
		'ended_at',
		'status'
	];

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function participants()
	{
		return $this->hasMany(Participant::class, 'session_id');
	}
}
