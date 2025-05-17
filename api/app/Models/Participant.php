<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Participant
 * 
 * @property int $id
 * @property int|null $session_id
 * @property int|null $user_id
 * @property string|null $pseudo
 * @property int $score
 * @property Carbon $joined_at
 * 
 * @property QuizSession|null $quiz_session
 * @property User|null $user
 * @property Collection|Answer[] $answers
 *
 * @package App\Models
 */
class Participant extends Model
{
	protected $table = 'participants';
	public $timestamps = false;

	protected $casts = [
		'session_id' => 'int',
		'user_id' => 'int',
		'score' => 'int',
		'joined_at' => 'datetime'
	];

	protected $fillable = [
		'session_id',
		'user_id',
		'pseudo',
		'score',
		'joined_at'
	];

	public function quiz_session()
	{
		return $this->belongsTo(QuizSession::class, 'session_id');
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function answers()
	{
		return $this->belongsToMany(Answer::class, 'participant_answers')
					->withPivot('id', 'question_id', 'response_time', 'points_earned');
	}
}
