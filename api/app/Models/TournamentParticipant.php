<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TournamentParticipant
 * 
 * @property int $id
 * @property int $tournament_id
 * @property int $user_id
 * @property Carbon $registered_at
 * @property bool $is_approved
 * @property int|null $final_position
 * @property int $total_score
 * @property int $matches_won
 * @property int $matches_lost
 * @property bool $is_disqualified
 * @property string|null $disqualification_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Tournament $tournament
 * @property User $user
 *
 * @package App\Models
 */
class TournamentParticipant extends Model
{
	protected $table = 'tournament_participants';

	protected $casts = [
		'tournament_id' => 'int',
		'user_id' => 'int',
		'registered_at' => 'datetime',
		'is_approved' => 'bool',
		'final_position' => 'int',
		'total_score' => 'int',
		'matches_won' => 'int',
		'matches_lost' => 'int',
		'is_disqualified' => 'bool'
	];

	protected $fillable = [
		'tournament_id',
		'user_id',
		'registered_at',
		'is_approved',
		'final_position',
		'total_score',
		'matches_won',
		'matches_lost',
		'is_disqualified',
		'disqualification_reason'
	];

	public function tournament()
	{
		return $this->belongsTo(Tournament::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
