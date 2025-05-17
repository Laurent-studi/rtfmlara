<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserSoundPreference
 * 
 * @property int $id
 * @property int $user_id
 * @property bool $sounds_enabled
 * @property int $volume_level
 * @property array|null $disabled_categories
 * @property array|null $custom_settings
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 *
 * @package App\Models
 */
class UserSoundPreference extends Model
{
	protected $table = 'user_sound_preferences';

	protected $casts = [
		'user_id' => 'int',
		'sounds_enabled' => 'bool',
		'volume_level' => 'int',
		'disabled_categories' => 'json',
		'custom_settings' => 'json'
	];

	protected $fillable = [
		'user_id',
		'sounds_enabled',
		'volume_level',
		'disabled_categories',
		'custom_settings'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
