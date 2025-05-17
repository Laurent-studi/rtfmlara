<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningStats extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'quiz_id',
        'question_id',
        'correct_count',
        'incorrect_count',
        'average_time',
        'last_reviewed_at',
        'next_review_date',
    ];

    /**
     * Les attributs à caster.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'correct_count' => 'integer',
        'incorrect_count' => 'integer',
        'average_time' => 'float',
        'last_reviewed_at' => 'datetime',
        'next_review_date' => 'date',
    ];

    /**
     * Obtenir l'utilisateur associé à ces statistiques.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtenir le quiz associé à ces statistiques.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Obtenir la question associée à ces statistiques.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Calculer le taux de réussite pour cette statistique.
     * 
     * @return float
     */
    public function getSuccessRateAttribute(): float
    {
        $total = $this->correct_count + $this->incorrect_count;
        if ($total > 0) {
            return round(($this->correct_count / $total) * 100, 2);
        }
        return 0;
    }
}
