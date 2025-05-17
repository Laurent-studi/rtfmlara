<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable;

	protected $table = 'users';

	protected $hidden = [
		'password',
		'remember_token',
	];

	protected $fillable = [
		'username',
		'email',
		'password',
		'avatar',
		'push_enabled',
		'trophies_count',
		'achievement_points',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'email_verified_at' => 'datetime',
		'password' => 'hashed',
		'push_enabled' => 'boolean',
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

	/**
	 * Get the achievements of the user.
	 */
	public function achievements()
	{
		return $this->hasMany(UserAchievement::class);
	}

	/**
	 * Get the badges earned by the user.
	 */
	public function badges()
	{
		return $this->morphedByMany(Badge::class, 'achievable', 'user_achievements')
			->withPivot('earned_at', 'data');
	}

	/**
	 * Get the trophies earned by the user.
	 */
	public function trophies()
	{
		return $this->morphedByMany(Trophy::class, 'achievable', 'user_achievements')
			->withPivot('earned_at', 'data');
	}

	/**
	 * Get the stats of the user.
	 */
	public function stats()
	{
		return $this->hasOne(UserStat::class);
	}

	/**
	 * Get the quiz attempts of the user.
	 */
	public function quizAttempts()
	{
		return $this->hasMany(QuizAttempt::class);
	}

	/**
	 * Check if the user has a specific role.
	 *
	 * @param string $roleName
	 * @return bool
	 */
	public function hasRole(string $roleName): bool
	{
		return $this->roles()->where('name', $roleName)->exists();
	}

	/**
	 * Check if the user has a badge.
	 *
	 * @param int $badgeId
	 * @return bool
	 */
	public function hasBadge(int $badgeId): bool
	{
		return $this->badges()->where('id', $badgeId)->exists();
	}

	/**
	 * Check if the user has a trophy.
	 *
	 * @param int $trophyId
	 * @return bool
	 */
	public function hasTrophy(int $trophyId): bool
	{
		return $this->trophies()->where('id', $trophyId)->exists();
	}

	/**
	 * Calculate the total achievement points.
	 *
	 * @return int
	 */
	public function getAchievementPoints(): int
	{
		return $this->trophies()->sum('points');
	}

	/**
	 * Get badges that the user doesn't have yet.
	 *
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public function getUnachievedBadges()
	{
		$userBadgeIds = $this->badges()->pluck('id')->toArray();
		return Badge::whereNotIn('id', $userBadgeIds)
			->where('is_active', true)
			->get();
	}

	/**
	 * Get trophies that the user doesn't have yet.
	 *
	 * @return \Illuminate\Database\Eloquent\Collection
	 */
	public function getUnachievedTrophies()
	{
		$userTrophyIds = $this->trophies()->pluck('id')->toArray();
		return Trophy::whereNotIn('id', $userTrophyIds)
			->where('is_active', true)
			->get();
	}

	/**
	 * Check if the user can earn achievements of a specific category.
	 *
	 * @param string $category
	 * @return bool
	 */
	public function canEarnAchievementsInCategory(string $category): bool
	{
		// Vérifier les limitations par catégorie si nécessaire
		return true;
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
