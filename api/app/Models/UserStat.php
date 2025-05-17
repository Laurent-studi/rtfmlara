<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'quizzes_completed',
        'total_score',
        'average_score',
        'highest_score',
        'achievements_count',
        'badges_count',
        'streak_current',
        'streak_longest',
        'last_activity_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quizzes_completed' => 'integer',
        'total_score' => 'integer',
        'average_score' => 'float',
        'highest_score' => 'integer',
        'achievements_count' => 'integer',
        'badges_count' => 'integer',
        'streak_current' => 'integer',
        'streak_longest' => 'integer',
        'last_activity_date' => 'datetime',
    ];

    /**
     * Get the user that owns the stats.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Update the user's streak.
     *
     * @return void
     */
    public function updateStreak(): void
    {
        $lastActivity = $this->last_activity_date;
        $today = now()->startOfDay();

        // If last activity was yesterday, increment streak
        if ($lastActivity && $lastActivity->addDay()->startOfDay()->equalTo($today)) {
            $this->increment('streak_current');
            
            // Update longest streak if current is higher
            if ($this->streak_current > $this->streak_longest) {
                $this->update(['streak_longest' => $this->streak_current]);
            }
        } 
        // If last activity was more than a day ago, reset streak
        elseif (!$lastActivity || $lastActivity->addDay()->startOfDay()->lessThan($today)) {
            $this->update(['streak_current' => 1]);
        }

        // Update last activity date
        $this->update(['last_activity_date' => now()]);
    }
} 