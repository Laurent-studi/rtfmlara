<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TournamentMatch
 * 
 * @property int $id
 * @property int $tournament_id
 * @property int $round_id
 * @property int $match_number
 * @property int|null $player1_id
 * @property int|null $player2_id
 * @property int $player1_score
 * @property int $player2_score
 * @property int|null $winner_id
 * @property int|null $quiz_id
 * @property string $status
 * @property Carbon|null $scheduled_time
 * @property Carbon|null $completion_time
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User|null $user
 * @property Quiz|null $quiz
 * @property TournamentRound $tournament_round
 * @property Tournament $tournament
 *
 * @package App\Models
 */
class TournamentMatch extends Model
{
	protected $table = 'tournament_matches';

	protected $casts = [
		'tournament_id' => 'int',
		'round_id' => 'int',
		'match_number' => 'int',
		'player1_id' => 'int',
		'player2_id' => 'int',
		'player1_score' => 'int',
		'player2_score' => 'int',
		'winner_id' => 'int',
		'quiz_id' => 'int',
		'scheduled_time' => 'datetime',
		'completion_time' => 'datetime'
	];

	protected $fillable = [
		'tournament_id',
		'round_id',
		'match_number',
		'player1_id',
		'player2_id',
		'player1_score',
		'player2_score',
		'winner_id',
		'quiz_id',
		'status',
		'scheduled_time',
		'completion_time',
		'notes'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'winner_id');
	}

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function tournament_round()
	{
		return $this->belongsTo(TournamentRound::class, 'round_id');
	}

	public function tournament()
	{
		return $this->belongsTo(Tournament::class);
	}
}
