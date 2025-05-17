<?php

namespace App\Listeners;

use App\Events\BadgeEarned;
use App\Events\QuizCompleted;
use App\Events\TrophyAwarded;
use App\Models\Badge;
use App\Models\Trophy;
use App\Models\QuizAttempt;
use App\Models\UserStat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessQuizResults implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(QuizCompleted $event): void
    {
        try {
            // Enregistrer la tentative de quiz
            $attempt = QuizAttempt::create([
                'user_id' => $event->user->id,
                'quiz_id' => $event->quiz->id,
                'score' => $event->score,
                'total_questions' => $event->totalQuestions,
                'completed_at' => now()
            ]);

            // Mettre à jour les statistiques de l'utilisateur
            $userStat = UserStat::firstOrCreate(['user_id' => $event->user->id]);
            $userStat->increment('quizzes_completed');
            $userStat->increment('total_score', $event->score);
            $userStat->update([
                'average_score' => $userStat->quizzes_completed > 0 
                    ? $userStat->total_score / $userStat->quizzes_completed 
                    : 0
            ]);

            // Calculer le pourcentage obtenu
            $percentage = $event->totalQuestions > 0 
                ? ($event->score / $event->totalQuestions) * 100 
                : 0;

            // Vérifier si l'utilisateur a obtenu tous les points
            if ($percentage == 100) {
                // Attribuer un badge de score parfait si c'est la première fois
                $badge = Badge::where('code', 'perfect_score')->first();
                if ($badge && !$event->user->hasBadge($badge->id)) {
                    BadgeEarned::dispatch($event->user, $badge);
                }
            }

            // Vérifier si l'utilisateur a complété un certain nombre de quiz
            $quizCount = $userStat->quizzes_completed;
            
            if ($quizCount == 10) {
                $trophy = Trophy::where('code', 'quiz_master_bronze')->first();
                if ($trophy && !$event->user->hasTrophy($trophy->id)) {
                    TrophyAwarded::dispatch($event->user, $trophy);
                }
            } elseif ($quizCount == 50) {
                $trophy = Trophy::where('code', 'quiz_master_silver')->first();
                if ($trophy && !$event->user->hasTrophy($trophy->id)) {
                    TrophyAwarded::dispatch($event->user, $trophy);
                }
            } elseif ($quizCount == 100) {
                $trophy = Trophy::where('code', 'quiz_master_gold')->first();
                if ($trophy && !$event->user->hasTrophy($trophy->id)) {
                    TrophyAwarded::dispatch($event->user, $trophy);
                }
            }
            
            Log::info('Résultats du quiz traités', [
                'user_id' => $event->user->id,
                'quiz_id' => $event->quiz->id,
                'score' => $event->score,
                'total_questions' => $event->totalQuestions,
                'percentage' => $percentage
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement des résultats du quiz: ' . $e->getMessage(), [
                'user_id' => $event->user->id,
                'quiz_id' => $event->quiz->id
            ]);
            
            $this->fail($e);
        }
    }
}
