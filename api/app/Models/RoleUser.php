<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class RoleUser
 * 
 * @property int $user_id
 * @property int $role_id
 * @property Carbon $assigned_at
 * 
 * @property Role $role
 * @property User $user
 *
 * @package App\Models
 */
class RoleUser extends Model
{
	protected $table = 'role_user';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'role_id' => 'int',
		'assigned_at' => 'datetime'
	];

	protected $fillable = [
		'assigned_at'
	];

	public function role()
	{
		return $this->belongsTo(Role::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
