<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Interest
 * 
 * @property int $id
 * @property string $name
 * @property string|null $category
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|User[] $users
 *
 * @package App\Models
 */
class Interest extends Model
{
	protected $table = 'interests';

	protected $fillable = [
		'name',
		'category'
	];

	public function users()
	{
		return $this->belongsToMany(User::class, 'user_interests')
					->withPivot('weight');
	}
}
