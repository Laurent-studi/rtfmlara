<?php

namespace App\Models;

use Carbon\Carbon;
use App\Events\BadgeEarned;
use App\Events\TrophyAwarded;
use Illuminate\Support\Facades\Log;

/**
 * Service pour gérer l'attribution des achievements (badges et trophées)
 */
class AchievementService
{
    /**
     * Vérifier et attribuer les badges appropriés à un utilisateur
     * 
     * @param User $user
     * @return array Les nouveaux badges attribués
     */
    public function checkAndAwardBadges(User $user): array
    {
        $awardedBadges = [];
        
        // Récupérer tous les badges que l'utilisateur n'a pas encore
        $unachievedBadges = $user->getUnachievedBadges();
        
        foreach ($unachievedBadges as $badge) {
            // Vérifier si l'utilisateur remplit les critères pour ce badge
            if ($badge->checkCriteria($user)) {
                // Attribuer le badge
                $this->awardBadge($user, $badge);
                $awardedBadges[] = $badge;
            }
        }
        
        return $awardedBadges;
    }
    
    /**
     * Vérifier et attribuer les trophées appropriés à un utilisateur
     * 
     * @param User $user
     * @return array Les nouveaux trophées attribués
     */
    public function checkAndAwardTrophies(User $user): array
    {
        $awardedTrophies = [];
        
        // Récupérer tous les trophées que l'utilisateur n'a pas encore
        $unachievedTrophies = $user->getUnachievedTrophies();
        
        foreach ($unachievedTrophies as $trophy) {
            // Vérifier si l'utilisateur remplit les critères pour ce trophée
            if ($trophy->checkCriteria($user)) {
                // Attribuer le trophée
                $this->awardTrophy($user, $trophy);
                $awardedTrophies[] = $trophy;
            }
        }
        
        return $awardedTrophies;
    }
    
    /**
     * Attribuer un badge à un utilisateur
     * 
     * @param User $user
     * @param Badge $badge
     * @param array $data Données supplémentaires à stocker
     * @return UserAchievement
     */
    public function awardBadge(User $user, Badge $badge, array $data = []): UserAchievement
    {
        // Vérifier si l'utilisateur a déjà ce badge
        if ($user->hasBadge($badge->id)) {
            return $user->badges()->where('id', $badge->id)->first()->pivot;
        }
        
        // Créer l'achievement
        $achievement = new UserAchievement([
            'user_id' => $user->id,
            'achievable_type' => Badge::class,
            'achievable_id' => $badge->id,
            'earned_at' => Carbon::now(),
            'data' => $data,
        ]);
        
        $achievement->save();
        
        // Déclencher l'événement BadgeEarned
        event(new BadgeEarned($user, $badge, $achievement));
        
        Log::info("Badge '{$badge->name}' attribué à l'utilisateur {$user->username}");
        
        return $achievement;
    }
    
    /**
     * Attribuer un trophée à un utilisateur
     * 
     * @param User $user
     * @param Trophy $trophy
     * @param array $data Données supplémentaires à stocker
     * @return UserAchievement
     */
    public function awardTrophy(User $user, Trophy $trophy, array $data = []): UserAchievement
    {
        // Vérifier si l'utilisateur a déjà ce trophée
        if ($user->hasTrophy($trophy->id)) {
            return $user->trophies()->where('id', $trophy->id)->first()->pivot;
        }
        
        // Créer l'achievement
        $achievement = new UserAchievement([
            'user_id' => $user->id,
            'achievable_type' => Trophy::class,
            'achievable_id' => $trophy->id,
            'earned_at' => Carbon::now(),
            'data' => $data,
        ]);
        
        $achievement->save();
        
        // Mettre à jour les points de trophée de l'utilisateur
        $this->updateUserTrophyPoints($user);
        
        // Déclencher l'événement TrophyAwarded
        event(new TrophyAwarded($user, $trophy, $achievement));
        
        Log::info("Trophée '{$trophy->name}' attribué à l'utilisateur {$user->username}");
        
        return $achievement;
    }
    
    /**
     * Mettre à jour les points de trophée de l'utilisateur
     * 
     * @param User $user
     * @return int Le nombre total de points
     */
    protected function updateUserTrophyPoints(User $user): int
    {
        $points = $user->getAchievementPoints();
        
        $user->achievement_points = $points;
        $user->save();
        
        return $points;
    }
} 