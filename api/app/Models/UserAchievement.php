<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Class UserAchievement
 * 
 * @property int $id
 * @property int $user_id
 * @property string $achievable_type
 * @property int $achievable_id
 * @property Carbon $earned_at
 * @property array|null $data
 * 
 * @property User $user
 * @property Achievement $achievable
 *
 * @package App\Models
 */
class UserAchievement extends Model
{
	use HasFactory;

	/**
	 * Le nom de la table associée au modèle.
	 *
	 * @var string
	 */
	protected $table = 'user_achievements';

	/**
	 * Indique si le modèle utilise les timestamps.
	 *
	 * @var bool
	 */
	public $timestamps = false;

	/**
	 * Les attributs qui doivent être convertis.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'user_id' => 'int',
		'achievable_id' => 'int',
		'earned_at' => 'datetime',
		'data' => 'array',
	];

	/**
	 * Les attributs qui sont assignables en masse.
	 *
	 * @var array<int, string>
	 */
	protected $fillable = [
		'user_id',
		'achievable_type',
		'achievable_id',
		'earned_at',
		'data',
	];

	/**
	 * Obtenir l'utilisateur associé à cette réalisation.
	 */
	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}

	/**
	 * Obtenir l'achievement polymorphique (badge ou trophée).
	 */
	public function achievable(): MorphTo
	{
		return $this->morphTo();
	}

	/**
	 * Vérifier si l'achievement est un badge.
	 * 
	 * @return bool
	 */
	public function isBadge(): bool
	{
		return $this->achievable_type === Badge::class;
	}

	/**
	 * Vérifier si l'achievement est un trophée.
	 * 
	 * @return bool
	 */
	public function isTrophy(): bool
	{
		return $this->achievable_type === Trophy::class;
	}
}
