<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserInterest;
use App\Models\UserTheme;
use App\Models\UserSoundPreference;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Récupère le profil de l'utilisateur actuellement connecté.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Récupérer l'utilisateur connecté
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        // Charger les relations utiles pour le profil
        $user->load([
            'interests', 
            'themes', 
            'user_achievements.badge', 
            'user_sound_preferences.sound_effect',
            'roles'
        ]);
        
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Cette méthode n'est pas utilisée dans ce contexte.
     * La création de profil se fait via l'inscription.
     */
    public function store(Request $request)
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Méthode non autorisée. Veuillez utiliser l\'API d\'inscription.'
        ], Response::HTTP_METHOD_NOT_ALLOWED);
    }

    /**
     * Récupère le profil d'un utilisateur spécifique.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = User::with([
            'interests', 
            'themes', 
            'user_achievements.badge', 
            'user_sound_preferences.sound_effect',
            'roles'
        ])->find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Filtrer les informations sensibles pour les profils publics
        $profileData = [
            'id' => $user->id,
            'username' => $user->username,
            'avatar' => $user->avatar,
            'created_at' => $user->created_at,
            'achievements' => $user->user_achievements,
            'interests' => $user->interests,
            'themes' => $user->themes
        ];
        
        return response()->json([
            'status' => 'success',
            'data' => $profileData
        ]);
    }

    /**
     * Met à jour le profil de l'utilisateur connecté.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        // Récupérer l'utilisateur connecté
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $validator = Validator::make($request->all(), [
            'username' => [
                'sometimes', 
                'required', 
                'string', 
                'max:50',
                Rule::unique('users')->ignore($user->id)
            ],
            'email' => [
                'sometimes', 
                'required', 
                'email', 
                Rule::unique('users')->ignore($user->id)
            ],
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|required|string|min:8|confirmed',
            'avatar' => 'sometimes|nullable|string',
            'interests' => 'sometimes|array',
            'interests.*.id' => 'required|exists:interests,id',
            'interests.*.weight' => 'sometimes|numeric|min:0|max:1'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        // Vérification du mot de passe actuel si modification du mot de passe
        if ($request->has('password')) {
            if (!$request->has('current_password') || !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Le mot de passe actuel est incorrect'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $user->password = Hash::make($request->password);
        }
        
        // Mise à jour des champs de base
        if ($request->has('username')) {
            $user->username = $request->username;
        }
        
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        
        if ($request->has('avatar')) {
            $user->avatar = $request->avatar;
        }
        
        $user->save();
        
        // Mise à jour des centres d'intérêt si fournis
        if ($request->has('interests')) {
            // Supprimer les intérêts existants
            UserInterest::where('user_id', $user->id)->delete();
            
            // Ajouter les nouveaux intérêts
            foreach ($request->interests as $interest) {
                UserInterest::create([
                    'user_id' => $user->id,
                    'interest_id' => $interest['id'],
                    'weight' => $interest['weight'] ?? 0.5
                ]);
            }
        }
        
        // Recharger l'utilisateur avec ses relations
        $user->load([
            'interests', 
            'themes', 
            'user_achievements.badge', 
            'user_sound_preferences.sound_effect'
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Profil mis à jour avec succès',
            'data' => $user
        ]);
    }

    /**
     * Met à jour le profil d'un utilisateur spécifique (admin uniquement).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function updateUser(Request $request, $id)
    {
        // Vérifier si l'utilisateur connecté est admin
        $currentUser = Auth::user();
        
        if (!$currentUser || !$currentUser->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Privilèges administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $validator = Validator::make($request->all(), [
            'username' => [
                'sometimes', 
                'required', 
                'string', 
                'max:50',
                Rule::unique('users')->ignore($user->id)
            ],
            'email' => [
                'sometimes', 
                'required', 
                'email', 
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|required|string|min:8',
            'avatar' => 'sometimes|nullable|string',
            'interests' => 'sometimes|array',
            'interests.*.id' => 'required|exists:interests,id',
            'interests.*.weight' => 'sometimes|numeric|min:0|max:1'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        // Mise à jour des champs
        if ($request->has('username')) {
            $user->username = $request->username;
        }
        
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        
        if ($request->has('avatar')) {
            $user->avatar = $request->avatar;
        }
        
        $user->save();
        
        // Mise à jour des centres d'intérêt si fournis
        if ($request->has('interests')) {
            // Supprimer les intérêts existants
            UserInterest::where('user_id', $user->id)->delete();
            
            // Ajouter les nouveaux intérêts
            foreach ($request->interests as $interest) {
                UserInterest::create([
                    'user_id' => $user->id,
                    'interest_id' => $interest['id'],
                    'weight' => $interest['weight'] ?? 0.5
                ]);
            }
        }
        
        // Recharger l'utilisateur avec ses relations
        $user->load([
            'interests', 
            'themes', 
            'user_achievements.badge', 
            'user_sound_preferences.sound_effect'
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Profil utilisateur mis à jour avec succès',
            'data' => $user
        ]);
    }

    /**
     * Supprime un utilisateur (auto-suppression ou admin).
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $currentUser = Auth::user();
        
        // Vérifier s'il s'agit d'une auto-suppression ou d'une action d'administrateur
        if ($currentUser->id == $id || $currentUser->roles()->where('name', 'admin')->exists()) {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Utilisateur non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }
            
            // On pourrait ajouter d'autres vérifications de sécurité ici
            // Par exemple, vérifier si l'utilisateur n'a pas de quizzes actifs, etc.
            
            $user->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Compte utilisateur supprimé avec succès'
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Action non autorisée'
        ], Response::HTTP_FORBIDDEN);
    }
}
