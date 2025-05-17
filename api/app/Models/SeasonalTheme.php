<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class SeasonalTheme
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $css_class
 * @property array|null $colors
 * @property string|null $background_image
 * @property string|null $logo_image
 * @property bool $is_active
 * @property Carbon|null $start_date
 * @property Carbon|null $end_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class SeasonalTheme extends Model
{
	protected $table = 'seasonal_themes';

	protected $casts = [
		'colors' => 'json',
		'is_active' => 'bool',
		'start_date' => 'datetime',
		'end_date' => 'datetime'
	];

	protected $fillable = [
		'name',
		'description',
		'css_class',
		'colors',
		'background_image',
		'logo_image',
		'is_active',
		'start_date',
		'end_date'
	];
}
