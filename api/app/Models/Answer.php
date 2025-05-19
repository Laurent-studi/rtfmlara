<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Answer
 * 
 * @property int $id
 * @property int|null $question_id
 * @property string $answer_text
 * @property bool $is_correct
 * @property string|null $explanation
 * @property Carbon $created_at
 * 
 * @property Question|null $question
 * @property Collection|Participant[] $participants
 *
 * @package App\Models
 */
class Answer extends Model
{
	protected $table = 'answers';
	public $timestamps = false;

	protected $casts = [
		'question_id' => 'int',
		'is_correct' => 'bool'
	];

	protected $fillable = [
		'question_id',
		'answer_text',
		'is_correct',
		'explanation'
	];

	public function question()
	{
		return $this->belongsTo(Question::class);
	}

	public function participants()
	{
		return $this->belongsToMany(Participant::class, 'participant_answers')
					->withPivot('id', 'question_id', 'response_time', 'points_earned');
	}
}
