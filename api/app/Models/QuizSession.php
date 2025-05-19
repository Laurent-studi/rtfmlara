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
 * @property int|null $presenter_id
 * @property Carbon|null $started_at
 * @property Carbon|null $ended_at
 * @property string $status
 * @property string|null $join_code
 * @property int $current_question_index
 * @property bool $is_presentation_mode
 * @property array|null $session_settings
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Quiz|null $quiz
 * @property User|null $presenter
 * @property Collection|Participant[] $participants
 *
 * @package App\Models
 */
class QuizSession extends Model
{
	protected $table = 'quiz_sessions';

	protected $casts = [
		'quiz_id' => 'int',
		'presenter_id' => 'int',
		'started_at' => 'datetime',
		'ended_at' => 'datetime',
		'current_question_index' => 'int',
		'is_presentation_mode' => 'bool',
		'session_settings' => 'array'
	];

	protected $fillable = [
		'quiz_id',
		'presenter_id',
		'started_at',
		'ended_at',
		'status',
		'join_code',
		'current_question_index',
		'is_presentation_mode',
		'session_settings'
	];

	/**
	 * Génère un code de participation unique pour la session.
	 *
	 * @return string
	 */
	public static function generateJoinCode()
	{
		$characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$code = '';
		
		do {
			$code = '';
			for ($i = 0; $i < 6; $i++) {
				$code .= $characters[random_int(0, strlen($characters) - 1)];
			}
		} while (self::where('join_code', $code)->exists());
		
		return $code;
	}

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function presenter()
	{
		return $this->belongsTo(User::class, 'presenter_id');
	}

	public function participants()
	{
		return $this->hasMany(Participant::class, 'quiz_session_id');
	}
	
	/**
	 * Obtient la question actuelle en fonction de l'index.
	 *
	 * @return Question|null
	 */
	public function getCurrentQuestion()
	{
		if (!$this->quiz) {
			return null;
		}
		
		return $this->quiz->questions()
			->orderBy('order_index', 'asc')
			->skip($this->current_question_index)
			->first();
	}
	
	/**
	 * Obtient le nombre total de questions dans ce quiz.
	 *
	 * @return int
	 */
	public function getTotalQuestionsCount()
	{
		if (!$this->quiz) {
			return 0;
		}
		
		return $this->quiz->questions()->count();
	}
	
	/**
	 * Détermine si toutes les questions ont été traitées.
	 *
	 * @return bool
	 */
	public function isLastQuestion()
	{
		return $this->current_question_index >= $this->getTotalQuestionsCount() - 1;
	}
	
	/**
	 * Passe à la question suivante et retourne cette question.
	 *
	 * @return Question|null
	 */
	public function nextQuestion()
	{
		if ($this->isLastQuestion()) {
			return null;
		}
		
		$this->current_question_index++;
		$this->save();
		
		return $this->getCurrentQuestion();
	}
	
	/**
	 * Retourne au classement entre les questions.
	 *
	 * @return array
	 */
	public function getLeaderboard()
	{
		$participants = $this->participants()
			->with('user')
			->orderBy('score', 'desc')
			->get();
			
		$leaderboard = [];
		
		foreach ($participants as $index => $participant) {
			$leaderboard[] = [
				'position' => $index + 1,
				'participant_id' => $participant->id,
				'user_id' => $participant->user_id,
				'name' => $participant->user ? $participant->user->name : $participant->pseudo,
				'score' => $participant->score,
				'avatar' => $participant->user ? $participant->user->avatar : null
			];
		}
		
		return $leaderboard;
	}
}
