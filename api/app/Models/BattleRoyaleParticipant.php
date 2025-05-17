<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class BattleRoyaleParticipant
 * 
 * @property int $id
 * @property int|null $session_id
 * @property int|null $user_id
 * @property int|null $position
 * @property Carbon|null $eliminated_at
 * @property int $score
 * 
 * @property BattleRoyaleSession|null $battle_royale_session
 * @property User|null $user
 *
 * @package App\Models
 */
class BattleRoyaleParticipant extends Model
{
	protected $table = 'battle_royale_participants';
	public $timestamps = false;

	protected $casts = [
		'session_id' => 'int',
		'user_id' => 'int',
		'position' => 'int',
		'eliminated_at' => 'datetime',
		'score' => 'int'
	];

	protected $fillable = [
		'session_id',
		'user_id',
		'position',
		'eliminated_at',
		'score'
	];

	public function battle_royale_session()
	{
		return $this->belongsTo(BattleRoyaleSession::class, 'session_id');
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
