<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class User
 * 
 * @property int $id
 * @property string $username
 * @property string $email
 * @property string $password
 * @property string|null $avatar
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|BattleRoyaleParticipant[] $battle_royale_participants
 * @property Collection|Challenge[] $challenges
 * @property Collection|CustomAvatar[] $custom_avatars
 * @property Collection|LearningStat[] $learning_stats
 * @property Collection|Notification[] $notifications
 * @property Collection|OfflineSession[] $offline_sessions
 * @property Collection|Participant[] $participants
 * @property Collection|PdfExport[] $pdf_exports
 * @property Collection|Quiz[] $quizzes
 * @property Collection|Role[] $roles
 * @property Collection|Theme[] $themes
 * @property Collection|TournamentMatch[] $tournament_matches
 * @property Collection|TournamentParticipant[] $tournament_participants
 * @property Collection|Tournament[] $tournaments
 * @property Collection|UserAchievement[] $user_achievements
 * @property Collection|Interest[] $interests
 * @property Collection|UserSoundPreference[] $user_sound_preferences
 *
 * @package App\Models
 */
class User extends Model
{
	protected $table = 'users';

	protected $hidden = [
		'password'
	];

	protected $fillable = [
		'username',
		'email',
		'password',
		'avatar'
	];

	public function battle_royale_participants()
	{
		return $this->hasMany(BattleRoyaleParticipant::class);
	}

	public function challenges()
	{
		return $this->hasMany(Challenge::class, 'winner_id');
	}

	public function custom_avatars()
	{
		return $this->hasMany(CustomAvatar::class);
	}

	public function learning_stats()
	{
		return $this->hasMany(LearningStat::class);
	}

	public function notifications()
	{
		return $this->hasMany(Notification::class);
	}

	public function offline_sessions()
	{
		return $this->hasMany(OfflineSession::class);
	}

	public function participants()
	{
		return $this->hasMany(Participant::class);
	}

	public function pdf_exports()
	{
		return $this->hasMany(PdfExport::class);
	}

	public function quizzes()
	{
		return $this->hasMany(Quiz::class, 'creator_id');
	}

	public function roles()
	{
		return $this->belongsToMany(Role::class)
					->withPivot('assigned_at');
	}

	public function themes()
	{
		return $this->belongsToMany(Theme::class, 'user_themes')
					->withPivot('id', 'applied_at');
	}

	public function tournament_matches()
	{
		return $this->hasMany(TournamentMatch::class, 'winner_id');
	}

	public function tournament_participants()
	{
		return $this->hasMany(TournamentParticipant::class);
	}

	public function tournaments()
	{
		return $this->hasMany(Tournament::class, 'creator_id');
	}

	public function user_achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}

	public function interests()
	{
		return $this->belongsToMany(Interest::class, 'user_interests')
					->withPivot('weight');
	}

	public function user_sound_preferences()
	{
		return $this->hasMany(UserSoundPreference::class);
	}
}
