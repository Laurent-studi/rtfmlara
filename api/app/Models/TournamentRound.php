<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TournamentRound
 * 
 * @property int $id
 * @property int $tournament_id
 * @property int $round_number
 * @property string $status
 * @property Carbon|null $start_time
 * @property Carbon|null $end_time
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Tournament $tournament
 * @property Collection|TournamentMatch[] $tournament_matches
 *
 * @package App\Models
 */
class TournamentRound extends Model
{
	protected $table = 'tournament_rounds';

	protected $casts = [
		'tournament_id' => 'int',
		'round_number' => 'int',
		'start_time' => 'datetime',
		'end_time' => 'datetime'
	];

	protected $fillable = [
		'tournament_id',
		'round_number',
		'status',
		'start_time',
		'end_time'
	];

	public function tournament()
	{
		return $this->belongsTo(Tournament::class);
	}

	public function tournament_matches()
	{
		return $this->hasMany(TournamentMatch::class, 'round_id');
	}
}
