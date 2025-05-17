<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserTheme
 * 
 * @property int $id
 * @property int $user_id
 * @property int $theme_id
 * @property Carbon $applied_at
 * 
 * @property Theme $theme
 * @property User $user
 *
 * @package App\Models
 */
class UserTheme extends Model
{
	protected $table = 'user_themes';
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'theme_id' => 'int',
		'applied_at' => 'datetime'
	];

	protected $fillable = [
		'user_id',
		'theme_id',
		'applied_at'
	];

	public function theme()
	{
		return $this->belongsTo(Theme::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
