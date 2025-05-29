<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Theme
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $primary_color
 * @property string $secondary_color
 * @property string|null $accent_color
 * @property string $text_color
 * @property string $background_color
 * @property string|null $card_color
 * @property bool $is_dark
 * @property string|null $font_family
 * @property int $border_radius
 * @property string|null $css_variables
 * @property bool $is_default
 * @property bool $is_user_selectable
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User|null $user
 * @property Collection|User[] $users
 *
 * @package App\Models
 */
class Theme extends Model
{
	protected $table = 'themes';

	protected $casts = [
		'is_dark' => 'bool',
		'border_radius' => 'int',
		'is_default' => 'bool',
		'is_user_selectable' => 'bool',
		'created_by' => 'int',
		'is_active' => 'boolean',
	];

	protected $fillable = [
		'name',
		'code',
		'filename',
		'description',
		'is_default',
		'is_active',
		'primary_color',
		'secondary_color',
		'accent_color',
		'text_color',
		'background_color',
		'card_color',
		'is_dark',
		'font_family',
		'border_radius',
		'css_variables',
		'is_user_selectable',
		'created_by'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'created_by');
	}

	/**
	 * Les utilisateurs qui ont ce thème comme préférence
	 */
	public function users()
	{
		return $this->hasMany(UserPreference::class);
	}

	/**
	 * Retourne le thème par défaut
	 */
	public static function getDefaultTheme()
	{
		return self::where('is_default', true)->first();
	}

	/**
	 * Retourne tous les thèmes actifs
	 */
	public static function getActiveThemes()
	{
		return self::where('is_active', true)->get();
	}

	/**
	 * Définit ce thème comme le thème par défaut
	 */
	public function setAsDefault()
	{
		self::where('is_default', true)
			->where('id', '!=', $this->id)
			->update(['is_default' => false]);
		
		$this->is_default = true;
		$this->save();
		
		return $this;
	}
}
