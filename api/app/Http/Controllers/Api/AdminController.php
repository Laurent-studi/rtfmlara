<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Récupère la liste de tous les utilisateurs
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllUsers()
    {
        // Vérifier si l'utilisateur est administrateur
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('super_admin')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
            ], 403);
        }

        $users = User::with('roles')->get();

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /**
     * Récupère la liste de tous les rôles disponibles
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllRoles()
    {
        // Vérifier si l'utilisateur est administrateur
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('super_admin')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
            ], 403);
        }

        $roles = Role::all();

        return response()->json([
            'status' => 'success',
            'data' => $roles
        ]);
    }

    /**
     * Attribue un rôle à un utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function assignRole(Request $request, $userId)
    {
        // Vérifier si l'utilisateur est administrateur
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('super_admin')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $role = Role::find($request->role_id);
        
        // Vérifier si l'utilisateur a déjà ce rôle
        if ($user->hasRole($role->name)) {
            return response()->json([
                'status' => 'error',
                'message' => 'L\'utilisateur possède déjà ce rôle'
            ], 422);
        }

        // Attribution du rôle
        $user->roles()->attach($request->role_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Rôle attribué avec succès',
            'data' => [
                'user' => $user->fresh('roles')
            ]
        ]);
    }

    /**
     * Retire un rôle à un utilisateur
     *
     * @param  int  $userId
     * @param  int  $roleId
     * @return \Illuminate\Http\Response
     */
    public function removeRole($userId, $roleId)
    {
        // Vérifier si l'utilisateur est administrateur
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('super_admin')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
            ], 403);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $role = Role::find($roleId);
        if (!$role) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rôle non trouvé'
            ], 404);
        }

        // Vérifier si l'utilisateur a ce rôle
        if (!$user->hasRole($role->name)) {
            return response()->json([
                'status' => 'error',
                'message' => 'L\'utilisateur ne possède pas ce rôle'
            ], 422);
        }

        // Protection contre la suppression du dernier super_admin
        if ($role->name === 'super_admin') {
            $superAdminCount = DB::table('role_user')
                ->join('roles', 'roles.id', '=', 'role_user.role_id')
                ->where('roles.name', 'super_admin')
                ->count();
            
            if ($superAdminCount <= 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Impossible de supprimer le dernier super admin'
                ], 422);
            }
        }

        // Retrait du rôle
        $user->roles()->detach($roleId);

        return response()->json([
            'status' => 'success',
            'message' => 'Rôle retiré avec succès',
            'data' => [
                'user' => $user->fresh('roles')
            ]
        ]);
    }
} 