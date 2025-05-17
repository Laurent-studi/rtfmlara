<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Tournament
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $status
 * @property Carbon $registration_start
 * @property Carbon $registration_end
 * @property Carbon $start_date
 * @property Carbon|null $end_date
 * @property int $creator_id
 * @property int $max_participants
 * @property string $format
 * @property int $rounds
 * @property int $min_participants
 * @property array|null $rules
 * @property array|null $prizes
 * @property string|null $banner_image
 * @property string $tournament_code
 * @property bool $is_featured
 * @property bool $require_approval
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 * @property Collection|TournamentMatch[] $tournament_matches
 * @property Collection|TournamentParticipant[] $tournament_participants
 * @property Collection|TournamentRound[] $tournament_rounds
 *
 * @package App\Models
 */
class Tournament extends Model
{
	protected $table = 'tournaments';

	protected $casts = [
		'registration_start' => 'datetime',
		'registration_end' => 'datetime',
		'start_date' => 'datetime',
		'end_date' => 'datetime',
		'creator_id' => 'int',
		'max_participants' => 'int',
		'rounds' => 'int',
		'min_participants' => 'int',
		'rules' => 'json',
		'prizes' => 'json',
		'is_featured' => 'bool',
		'require_approval' => 'bool'
	];

	protected $fillable = [
		'name',
		'description',
		'status',
		'registration_start',
		'registration_end',
		'start_date',
		'end_date',
		'creator_id',
		'max_participants',
		'format',
		'rounds',
		'min_participants',
		'rules',
		'prizes',
		'banner_image',
		'tournament_code',
		'is_featured',
		'require_approval'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'creator_id');
	}

	public function tournament_matches()
	{
		return $this->hasMany(TournamentMatch::class);
	}

	public function tournament_participants()
	{
		return $this->hasMany(TournamentParticipant::class);
	}

	public function tournament_rounds()
	{
		return $this->hasMany(TournamentRound::class);
	}
}
