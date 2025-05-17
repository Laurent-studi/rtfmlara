<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Question
 * 
 * @property int $id
 * @property int|null $quiz_id
 * @property string $question_text
 * @property int $points
 * @property int|null $order_index
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Quiz|null $quiz
 * @property Collection|Answer[] $answers
 * @property Collection|LearningStat[] $learning_stats
 * @property Collection|ParticipantAnswer[] $participant_answers
 *
 * @package App\Models
 */
class Question extends Model
{
	protected $table = 'questions';

	protected $casts = [
		'quiz_id' => 'int',
		'points' => 'int',
		'order_index' => 'int'
	];

	protected $fillable = [
		'quiz_id',
		'question_text',
		'points',
		'order_index'
	];

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function answers()
	{
		return $this->hasMany(Answer::class);
	}

	public function learning_stats()
	{
		return $this->hasMany(LearningStat::class);
	}

	public function participant_answers()
	{
		return $this->hasMany(ParticipantAnswer::class);
	}
}
