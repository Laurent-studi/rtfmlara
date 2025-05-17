<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CustomAnimation
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array|null $animation_data
 * @property string $category
 * @property Carbon $created_at
 *
 * @package App\Models
 */
class CustomAnimation extends Model
{
	protected $table = 'custom_animations';
	public $timestamps = false;

	protected $casts = [
		'animation_data' => 'json'
	];

	protected $fillable = [
		'name',
		'description',
		'animation_data',
		'category'
	];
}
