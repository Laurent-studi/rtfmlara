<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserFriend
 * 
 * @property int $id
 * @property int $user_id
 * @property int $friend_id
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 * @property User $friend
 *
 * @package App\Models
 */
class UserFriend extends Model
{
    protected $table = 'user_friends';

    protected $casts = [
        'user_id' => 'int',
        'friend_id' => 'int'
    ];

    protected $fillable = [
        'user_id',
        'friend_id',
        'status'
    ];

    /**
     * Les statuts possibles d'une relation d'amitié
     */
    const STATUS_PENDING = 'pending';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_BLOCKED = 'blocked';

    /**
     * L'utilisateur qui a initié la relation d'amitié
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * L'utilisateur ami
     */
    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }
    
    /**
     * Vérifier si deux utilisateurs sont amis
     * 
     * @param int $userId
     * @param int $friendId
     * @return bool
     */
    public static function areFriends($userId, $friendId)
    {
        return self::where(function($query) use ($userId, $friendId) {
                $query->where('user_id', $userId)
                      ->where('friend_id', $friendId);
            })
            ->orWhere(function($query) use ($userId, $friendId) {
                $query->where('user_id', $friendId)
                      ->where('friend_id', $userId);
            })
            ->where('status', self::STATUS_ACCEPTED)
            ->exists();
    }
    
    /**
     * Obtenir toutes les relations d'amitié d'un utilisateur
     * 
     * @param int $userId
     * @param string $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getFriendships($userId, $status = null)
    {
        $query = self::where(function($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhere('friend_id', $userId);
            });
            
        if ($status) {
            $query->where('status', $status);
        }
        
        return $query->get();
    }
    
    /**
     * Obtenir la liste des IDs des amis d'un utilisateur
     * 
     * @param int $userId
     * @return array
     */
    public static function getFriendIds($userId)
    {
        $sentRequests = self::where('user_id', $userId)
            ->where('status', self::STATUS_ACCEPTED)
            ->pluck('friend_id')
            ->toArray();
            
        $receivedRequests = self::where('friend_id', $userId)
            ->where('status', self::STATUS_ACCEPTED)
            ->pluck('user_id')
            ->toArray();
            
        return array_merge($sentRequests, $receivedRequests);
    }
} 