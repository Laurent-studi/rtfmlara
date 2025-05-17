<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ParticipantAnswer
 * 
 * @property int $id
 * @property int|null $participant_id
 * @property int|null $question_id
 * @property int|null $answer_id
 * @property float|null $response_time
 * @property int|null $points_earned
 * @property Carbon $created_at
 * 
 * @property Answer|null $answer
 * @property Participant|null $participant
 * @property Question|null $question
 *
 * @package App\Models
 */
class ParticipantAnswer extends Model
{
	protected $table = 'participant_answers';
	public $timestamps = false;

	protected $casts = [
		'participant_id' => 'int',
		'question_id' => 'int',
		'answer_id' => 'int',
		'response_time' => 'float',
		'points_earned' => 'int'
	];

	protected $fillable = [
		'participant_id',
		'question_id',
		'answer_id',
		'response_time',
		'points_earned'
	];

	public function answer()
	{
		return $this->belongsTo(Answer::class);
	}

	public function participant()
	{
		return $this->belongsTo(Participant::class);
	}

	public function question()
	{
		return $this->belongsTo(Question::class);
	}
}
