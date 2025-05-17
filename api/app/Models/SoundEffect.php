<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class SoundEffect
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $file_path
 * @property string $category
 * @property string $trigger_event
 * @property bool $is_enabled
 * @property int $volume
 * @property int|null $duration_ms
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class SoundEffect extends Model
{
	protected $table = 'sound_effects';

	protected $casts = [
		'is_enabled' => 'bool',
		'volume' => 'int',
		'duration_ms' => 'int'
	];

	protected $fillable = [
		'name',
		'description',
		'file_path',
		'category',
		'trigger_event',
		'is_enabled',
		'volume',
		'duration_ms'
	];
}
