<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class BattleRoyaleSession
 * 
 * @property int $id
 * @property string $name
 * @property int $max_players
 * @property int $elimination_interval
 * @property string $status
 * @property Carbon|null $started_at
 * @property Carbon|null $ended_at
 * @property Carbon $created_at
 * 
 * @property Collection|BattleRoyaleParticipant[] $battle_royale_participants
 *
 * @package App\Models
 */
class BattleRoyaleSession extends Model
{
	protected $table = 'battle_royale_sessions';
	public $timestamps = false;

	protected $casts = [
		'max_players' => 'int',
		'elimination_interval' => 'int',
		'started_at' => 'datetime',
		'ended_at' => 'datetime'
	];

	protected $fillable = [
		'name',
		'max_players',
		'elimination_interval',
		'status',
		'started_at',
		'ended_at'
	];

	public function battle_royale_participants()
	{
		return $this->hasMany(BattleRoyaleParticipant::class, 'session_id');
	}
}
