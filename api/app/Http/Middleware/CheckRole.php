<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Vérifie si l'utilisateur possède le rôle requis pour accéder à une ressource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  Un ou plusieurs rôles dont l'utilisateur doit posséder au moins un
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Vérifier si l'utilisateur est authentifié
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();
        
        // Si aucun rôle n'est spécifié, on continue
        if (empty($roles)) {
            return $next($request);
        }
        
        // Si super_admin, on autorise toujours
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }
        
        // Vérifier si l'utilisateur a au moins un des rôles requis
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return $next($request);
            }
        }
        
        // L'utilisateur n'a pas le rôle requis
        return response()->json([
            'status' => 'error',
            'message' => 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
        ], Response::HTTP_FORBIDDEN);
    }
} 