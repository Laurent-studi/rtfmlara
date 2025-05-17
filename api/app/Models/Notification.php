<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Class Notification
 * 
 * @property int $id
 * @property int|null $user_id
 * @property string $title
 * @property string $message
 * @property string $type
 * @property bool $is_read
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User|null $user
 *
 * @package App\Models
 */
class Notification extends Model
{
	use HasFactory;

	protected $table = 'notifications';

	protected $casts = [
		'user_id' => 'int',
		'is_read' => 'bool',
		'data' => 'array',
		'read_at' => 'datetime',
	];

	protected $fillable = [
		'user_id',
		'type',
		'title',
		'content',
		'data',
		'read_at',
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	/**
	 * Scope a query to only include unread notifications.
	 */
	public function scopeUnread($query)
	{
		return $query->whereNull('read_at');
	}

	/**
	 * Mark the notification as read.
	 */
	public function markAsRead()
	{
		if (is_null($this->read_at)) {
			$this->update(['read_at' => now()]);
		}
	}
}
