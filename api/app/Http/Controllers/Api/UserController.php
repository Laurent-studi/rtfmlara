<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\RoleUser;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Affiche la liste des utilisateurs.
     * Accessible uniquement aux administrateurs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur est administrateur
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Privilèges administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $query = User::with('roles');
        
        // Filtre par rôle
        if ($request->has('role')) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }
        
        // Recherche par nom d'utilisateur ou email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->has('per_page') ? (int) $request->per_page : 15;
        $users = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /**
     * Crée un nouvel utilisateur.
     * Accessible uniquement aux administrateurs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur est administrateur
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Privilèges administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'avatar' => 'nullable|string',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::beginTransaction();
        try {
            // Créer l'utilisateur
            $newUser = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'avatar' => $request->avatar
            ]);
            
            // Attribuer les rôles si spécifiés
            if ($request->has('roles')) {
                foreach ($request->roles as $roleId) {
                    RoleUser::create([
                        'user_id' => $newUser->id,
                        'role_id' => $roleId,
                        'assigned_at' => now()
                    ]);
                }
            } else {
                // Par défaut, attribuer le rôle "user"
                $userRole = Role::where('name', 'user')->first();
                if ($userRole) {
                    RoleUser::create([
                        'user_id' => $newUser->id,
                        'role_id' => $userRole->id,
                        'assigned_at' => now()
                    ]);
                }
            }
            
            DB::commit();
            
            // Charger les relations pour la réponse
            $newUser->load('roles');
            
            return response()->json([
                'status' => 'success',
                'message' => 'Utilisateur créé avec succès',
                'data' => $newUser
            ], Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Affiche un utilisateur spécifique.
     * Accessible aux administrateurs ou à l'utilisateur lui-même.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $authUser = Auth::user();
        
        // Vérifier les permissions d'accès
        if (!$authUser || ($authUser->id != $id && !$authUser->roles()->where('name', 'admin')->exists())) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $user = User::with(['roles', 'interests', 'user_achievements.badge', 'user_achievements.trophy', 
                            'themes', 'user_sound_preferences.sound_effect', 'quizzes'])
                    ->find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Masquer le mot de passe
        $user->makeHidden('password');
        
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Met à jour un utilisateur spécifique.
     * Accessible aux administrateurs ou à l'utilisateur lui-même.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $authUser = Auth::user();
        $isAdmin = $authUser && $authUser->roles()->where('name', 'admin')->exists();
        
        // Vérifier les permissions d'accès
        if (!$authUser || ($authUser->id != $id && !$isAdmin)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $rules = [
            'username' => [
                'sometimes', 
                'required', 
                'string', 
                'max:50',
                Rule::unique('users')->ignore($id)
            ],
            'email' => [
                'sometimes', 
                'required', 
                'email',
                Rule::unique('users')->ignore($id)
            ],
            'avatar' => 'nullable|string'
        ];
        
        // Seuls les admins peuvent modifier les rôles
        if ($isAdmin) {
            $rules['roles'] = 'sometimes|array';
            $rules['roles.*'] = 'exists:roles,id';
            $rules['password'] = 'sometimes|string|min:8';
        } else {
            // Pour les utilisateurs normaux, exiger le mot de passe actuel
            $rules['current_password'] = 'required_with:password|string';
            $rules['password'] = 'sometimes|required|string|min:8|confirmed';
        }
        
        $validator = Validator::make($request->all(), $rules);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        // Si l'utilisateur n'est pas admin et essaie de changer son mot de passe
        if (!$isAdmin && $request->has('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Le mot de passe actuel est incorrect'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }
        
        DB::beginTransaction();
        try {
            // Mettre à jour les champs de l'utilisateur
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
            
            // Mettre à jour les rôles si admin
            if ($isAdmin && $request->has('roles')) {
                // Supprimer tous les rôles actuels
                RoleUser::where('user_id', $id)->delete();
                
                // Ajouter les nouveaux rôles
                foreach ($request->roles as $roleId) {
                    RoleUser::create([
                        'user_id' => $id,
                        'role_id' => $roleId,
                        'assigned_at' => now()
                    ]);
                }
            }
            
            DB::commit();
            
            // Recharger l'utilisateur avec ses relations
            $user->load('roles');
            
            return response()->json([
                'status' => 'success',
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Supprime un utilisateur spécifique.
     * Accessible uniquement aux administrateurs.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $authUser = Auth::user();
        
        // Vérifier si l'utilisateur est administrateur
        if (!$authUser || !$authUser->roles()->where('name', 'admin')->exists()) {
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
        
        // Empêcher la suppression de son propre compte
        if ($authUser->id == $id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], Response::HTTP_CONFLICT);
        }
        
        // Vérifier si l'utilisateur est un super admin
        if ($user->roles()->where('name', 'super_admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer un super administrateur'
            ], Response::HTTP_FORBIDDEN);
        }
        
        DB::beginTransaction();
        try {
            // Supprimer les relations de l'utilisateur
            // Note: à adapter selon les besoins spécifiques, certaines relations
            // pourraient nécessiter un traitement particulier
            RoleUser::where('user_id', $id)->delete();
            
            // Supprimer l'utilisateur
            $user->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Utilisateur supprimé avec succès'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Attribue un rôle à un utilisateur.
     * Accessible uniquement aux administrateurs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function assignRole(Request $request, $userId)
    {
        $authUser = Auth::user();
        
        // Vérifier si l'utilisateur est administrateur
        if (!$authUser || !$authUser->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Privilèges administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a déjà ce rôle
        $existingRole = RoleUser::where('user_id', $userId)
            ->where('role_id', $request->role_id)
            ->first();
            
        if ($existingRole) {
            return response()->json([
                'status' => 'error',
                'message' => 'L\'utilisateur possède déjà ce rôle'
            ], Response::HTTP_CONFLICT);
        }
        
        // Attribuer le rôle
        $role = Role::find($request->role_id);
        
        // Si on essaie d'attribuer le rôle super_admin, vérifier que l'utilisateur est super_admin
        if ($role->name === 'super_admin' && !$authUser->roles()->where('name', 'super_admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Seul un super administrateur peut attribuer ce rôle'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $roleUser = RoleUser::create([
            'user_id' => $userId,
            'role_id' => $request->role_id,
            'assigned_at' => now()
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Rôle attribué avec succès',
            'data' => [
                'user_id' => $userId,
                'role_id' => $request->role_id,
                'role_name' => $role->name
            ]
        ]);
    }

    /**
     * Retire un rôle à un utilisateur.
     * Accessible uniquement aux administrateurs.
     *
     * @param  int  $userId
     * @param  int  $roleId
     * @return \Illuminate\Http\Response
     */
    public function removeRole($userId, $roleId)
    {
        $authUser = Auth::user();
        
        // Vérifier si l'utilisateur est administrateur
        if (!$authUser || !$authUser->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Privilèges administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $role = Role::find($roleId);
        
        if (!$role) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rôle non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Si on essaie de retirer le rôle super_admin, vérifier que l'utilisateur est super_admin
        if ($role->name === 'super_admin' && !$authUser->roles()->where('name', 'super_admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Seul un super administrateur peut retirer ce rôle'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Vérifier que l'utilisateur a au moins un autre rôle
        if ($user->roles()->count() <= 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de retirer le dernier rôle d\'un utilisateur'
            ], Response::HTTP_CONFLICT);
        }
        
        $deleted = RoleUser::where('user_id', $userId)
            ->where('role_id', $roleId)
            ->delete();
            
        if (!$deleted) {
            return response()->json([
                'status' => 'error',
                'message' => 'L\'utilisateur ne possède pas ce rôle'
            ], Response::HTTP_NOT_FOUND);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Rôle retiré avec succès'
        ]);
    }
}
