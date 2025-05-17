<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class League
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $level
 * @property int $min_points
 * @property int|null $max_points
 * @property int $season
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class League extends Model
{
	protected $table = 'leagues';

	protected $casts = [
		'level' => 'int',
		'min_points' => 'int',
		'max_points' => 'int',
		'season' => 'int'
	];

	protected $fillable = [
		'name',
		'description',
		'level',
		'min_points',
		'max_points',
		'season',
		'status'
	];
}
