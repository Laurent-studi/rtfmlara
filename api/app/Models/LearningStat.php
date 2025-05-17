<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class LearningStat
 * 
 * @property int $id
 * @property int|null $user_id
 * @property int|null $quiz_id
 * @property int|null $question_id
 * @property int $correct_count
 * @property int $incorrect_count
 * @property float|null $average_time
 * @property Carbon|null $last_reviewed_at
 * @property Carbon|null $next_review_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Question|null $question
 * @property Quiz|null $quiz
 * @property User|null $user
 *
 * @package App\Models
 */
class LearningStat extends Model
{
	protected $table = 'learning_stats';

	protected $casts = [
		'user_id' => 'int',
		'quiz_id' => 'int',
		'question_id' => 'int',
		'correct_count' => 'int',
		'incorrect_count' => 'int',
		'average_time' => 'float',
		'last_reviewed_at' => 'datetime',
		'next_review_date' => 'datetime'
	];

	protected $fillable = [
		'user_id',
		'quiz_id',
		'question_id',
		'correct_count',
		'incorrect_count',
		'average_time',
		'last_reviewed_at',
		'next_review_date'
	];

	public function question()
	{
		return $this->belongsTo(Question::class);
	}

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
