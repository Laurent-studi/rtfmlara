<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Role
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array|null $permissions
 * @property bool $is_system
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|User[] $users
 *
 * @package App\Models
 */
class Role extends Model
{
	protected $table = 'roles';

	protected $casts = [
		'permissions' => 'json',
		'is_system' => 'bool'
	];

	protected $fillable = [
		'name',
		'description',
		'permissions',
		'is_system'
	];

	public function users()
	{
		return $this->belongsToMany(User::class)
					->withPivot('assigned_at');
	}
}
