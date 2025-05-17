<?php

namespace App\Providers;

use App\Models\Badge;
use App\Models\Notification;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Trophy;
use App\Models\User;
use App\Policies\BadgePolicy;
use App\Policies\NotificationPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\QuizPolicy;
use App\Policies\TrophyPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Quiz::class => QuizPolicy::class,
        Question::class => QuestionPolicy::class,
        Badge::class => BadgePolicy::class,
        Trophy::class => TrophyPolicy::class,
        Notification::class => NotificationPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Définir une gate pour permettre aux admins d'accéder à tout
        Gate::before(function (User $user, $ability) {
            if ($user->hasRole('super-admin')) {
                return true;
            }
        });
        
        // Permissions pour les ressources du tableau de bord
        Gate::define('access-dashboard', function (User $user) {
            return $user->hasRole('admin') || $user->hasRole('teacher');
        });
        
        // Permissions pour les statistiques globales du site
        Gate::define('view-site-statistics', function (User $user) {
            return $user->hasRole('admin');
        });
        
        // Permissions pour la modération des contenus
        Gate::define('moderate-content', function (User $user) {
            return $user->hasRole('admin') || $user->hasRole('moderator');
        });
        
        // Permissions pour la gestion des utilisateurs
        Gate::define('manage-users', function (User $user) {
            return $user->hasRole('admin');
        });
        
        // Permissions pour la configuration du système
        Gate::define('manage-system-settings', function (User $user) {
            return $user->hasRole('admin');
        });
    }
} 