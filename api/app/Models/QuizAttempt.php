<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'quiz_id',
        'score',
        'total_questions',
        'completed_at',
        'answers',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'integer',
        'total_questions' => 'integer',
        'completed_at' => 'datetime',
        'answers' => 'array',
    ];

    /**
     * Get the user that owns the quiz attempt.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the quiz that this is an attempt for.
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the percentage score for this attempt.
     *
     * @return float
     */
    public function getPercentageAttribute(): float
    {
        if ($this->total_questions === 0) {
            return 0;
        }
        
        return round(($this->score / $this->total_questions) * 100, 2);
    }
} 