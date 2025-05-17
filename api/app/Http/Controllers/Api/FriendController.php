<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserFriend;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FriendController extends Controller
{
    /**
     * Récupérer la liste des amis de l'utilisateur authentifié
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'status' => 'nullable|string|in:pending,accepted,rejected,blocked',
                'search' => 'nullable|string',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $status = $request->status ?? UserFriend::STATUS_ACCEPTED;
            
            // Requêtes d'amitié reçues
            $receivedFriendships = UserFriend::where('friend_id', $user->id);
            
            // Requêtes d'amitié envoyées
            $sentFriendships = UserFriend::where('user_id', $user->id);
            
            // Si un statut est spécifié, filtrer par ce statut
            if ($status) {
                $receivedFriendships->where('status', $status);
                $sentFriendships->where('status', $status);
            }
            
            // Combiner les deux collections
            $friendships = $receivedFriendships->get()
                ->merge($sentFriendships->get())
                ->sortByDesc('created_at');
            
            // Construire une liste d'utilisateurs amis avec des informations supplémentaires
            $friends = [];
            
            foreach ($friendships as $friendship) {
                $friendId = ($friendship->user_id == $user->id) ? $friendship->friend_id : $friendship->user_id;
                $friend = User::find($friendId);
                
                if ($friend) {
                    // Recherche par nom d'utilisateur
                    if ($request->has('search')) {
                        $search = $request->search;
                        if (!str_contains(strtolower($friend->username), strtolower($search))) {
                            continue;
                        }
                    }
                    
                    $friends[] = [
                        'id' => $friend->id,
                        'username' => $friend->username,
                        'email' => $friend->email,
                        'avatar' => $friend->avatar,
                        'friendship_status' => $friendship->status,
                        'is_sender' => $friendship->user_id == $user->id,
                        'created_at' => $friendship->created_at,
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => $friends
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des amis',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Envoyer une demande d'amitié à un utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function sendRequest(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'friend_id' => 'required|integer|exists:users,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $friendId = $request->friend_id;
            
            // Vérifier que l'utilisateur n'essaie pas de s'ajouter lui-même
            if ($user->id == $friendId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas vous ajouter vous-même comme ami'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Vérifier si une relation d'amitié existe déjà
            $existingFriendship = UserFriend::where(function($query) use ($user, $friendId) {
                    $query->where('user_id', $user->id)
                          ->where('friend_id', $friendId);
                })
                ->orWhere(function($query) use ($user, $friendId) {
                    $query->where('user_id', $friendId)
                          ->where('friend_id', $user->id);
                })
                ->first();
            
            if ($existingFriendship) {
                return response()->json([
                    'success' => false,
                    'message' => 'Une relation d\'amitié existe déjà avec cet utilisateur',
                    'status' => $existingFriendship->status
                ], Response::HTTP_BAD_REQUEST);
            }
            
            DB::beginTransaction();
            
            try {
                // Créer la demande d'amitié
                $friendship = UserFriend::create([
                    'user_id' => $user->id,
                    'friend_id' => $friendId,
                    'status' => UserFriend::STATUS_PENDING
                ]);
                
                // Créer une notification pour le destinataire
                Notification::create([
                    'user_id' => $friendId,
                    'type' => 'friend_request',
                    'content' => json_encode([
                        'sender_id' => $user->id,
                        'sender_name' => $user->username,
                        'friendship_id' => $friendship->id
                    ]),
                    'read' => false
                ]);
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Demande d\'amitié envoyée avec succès',
                    'data' => $friendship
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de l\'envoi de la demande d\'amitié',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Accepter une demande d'amitié
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function acceptRequest(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'friendship_id' => 'required|integer|exists:user_friends,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $friendshipId = $request->friendship_id;
            
            // Récupérer la demande d'amitié
            $friendship = UserFriend::find($friendshipId);
            
            // Vérifier que l'utilisateur est bien le destinataire de la demande
            if ($friendship->friend_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à accepter cette demande d\'amitié'
                ], Response::HTTP_FORBIDDEN);
            }
            
            // Vérifier que la demande est en attente
            if ($friendship->status != UserFriend::STATUS_PENDING) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette demande d\'amitié n\'est pas en attente'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            DB::beginTransaction();
            
            try {
                // Mettre à jour le statut de la demande
                $friendship->status = UserFriend::STATUS_ACCEPTED;
                $friendship->save();
                
                // Créer une notification pour l'expéditeur
                Notification::create([
                    'user_id' => $friendship->user_id,
                    'type' => 'friend_request_accepted',
                    'content' => json_encode([
                        'friend_id' => $user->id,
                        'friend_name' => $user->username,
                        'friendship_id' => $friendship->id
                    ]),
                    'read' => false
                ]);
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Demande d\'amitié acceptée avec succès',
                    'data' => $friendship
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de l\'acceptation de la demande d\'amitié',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Rejeter ou annuler une demande d'amitié
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function rejectRequest(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'friendship_id' => 'required|integer|exists:user_friends,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $friendshipId = $request->friendship_id;
            
            // Récupérer la demande d'amitié
            $friendship = UserFriend::find($friendshipId);
            
            // Vérifier que l'utilisateur est impliqué dans la demande
            if ($friendship->user_id != $user->id && $friendship->friend_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à gérer cette demande d\'amitié'
                ], Response::HTTP_FORBIDDEN);
            }
            
            // Si l'utilisateur est l'expéditeur, supprimer la demande
            // Si l'utilisateur est le destinataire, marquer comme rejetée
            if ($friendship->user_id == $user->id) {
                $friendship->delete();
                $message = 'Demande d\'amitié annulée avec succès';
            } else {
                $friendship->status = UserFriend::STATUS_REJECTED;
                $friendship->save();
                $message = 'Demande d\'amitié rejetée avec succès';
            }
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors du rejet de la demande d\'amitié',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Supprimer une relation d'amitié
     *
     * @param  int  $friendId
     * @return \Illuminate\Http\Response
     */
    public function removeFriend($friendId)
    {
        try {
            $user = Auth::user();
            
            // Vérifier que l'ami existe
            $friend = User::find($friendId);
            if (!$friend) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }
            
            // Récupérer la relation d'amitié
            $friendship = UserFriend::where(function($query) use ($user, $friendId) {
                    $query->where('user_id', $user->id)
                          ->where('friend_id', $friendId);
                })
                ->orWhere(function($query) use ($user, $friendId) {
                    $query->where('user_id', $friendId)
                          ->where('friend_id', $user->id);
                })
                ->where('status', UserFriend::STATUS_ACCEPTED)
                ->first();
            
            if (!$friendship) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune relation d\'amitié active trouvée avec cet utilisateur'
                ], Response::HTTP_NOT_FOUND);
            }
            
            // Supprimer la relation d'amitié
            $friendship->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Ami supprimé avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la suppression de l\'ami',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Bloquer un utilisateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function blockUser(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $blockedUserId = $request->user_id;
            
            // Vérifier que l'utilisateur n'essaie pas de se bloquer lui-même
            if ($user->id == $blockedUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas vous bloquer vous-même'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Vérifier si une relation existe déjà
            $existingRelation = UserFriend::where(function($query) use ($user, $blockedUserId) {
                    $query->where('user_id', $user->id)
                          ->where('friend_id', $blockedUserId);
                })
                ->orWhere(function($query) use ($user, $blockedUserId) {
                    $query->where('user_id', $blockedUserId)
                          ->where('friend_id', $user->id);
                })
                ->first();
            
            if ($existingRelation) {
                // Mettre à jour la relation existante
                $existingRelation->user_id = $user->id;
                $existingRelation->friend_id = $blockedUserId;
                $existingRelation->status = UserFriend::STATUS_BLOCKED;
                $existingRelation->save();
            } else {
                // Créer une nouvelle relation de blocage
                UserFriend::create([
                    'user_id' => $user->id,
                    'friend_id' => $blockedUserId,
                    'status' => UserFriend::STATUS_BLOCKED
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Utilisateur bloqué avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors du blocage de l\'utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Débloquer un utilisateur
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function unblockUser($userId)
    {
        try {
            $user = Auth::user();
            
            // Récupérer la relation de blocage
            $blockedRelation = UserFriend::where('user_id', $user->id)
                ->where('friend_id', $userId)
                ->where('status', UserFriend::STATUS_BLOCKED)
                ->first();
            
            if (!$blockedRelation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune relation de blocage trouvée avec cet utilisateur'
                ], Response::HTTP_NOT_FOUND);
            }
            
            // Supprimer la relation de blocage
            $blockedRelation->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Utilisateur débloqué avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors du déblocage de l\'utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Rechercher des utilisateurs qu'on peut ajouter comme amis
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function searchUsers(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'search' => 'required|string|min:2',
                'limit' => 'nullable|integer|min:1|max:50',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            $search = $request->search;
            $limit = $request->limit ?? 10;
            
            // Récupérer les IDs des amis actuels et des utilisateurs bloqués
            $friendshipQuery = UserFriend::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('friend_id', $user->id);
            });
            
            $existingFriendIds = [];
            foreach ($friendshipQuery->get() as $friendship) {
                if ($friendship->user_id == $user->id) {
                    $existingFriendIds[] = $friendship->friend_id;
                } else {
                    $existingFriendIds[] = $friendship->user_id;
                }
            }
            
            // Rechercher des utilisateurs par nom d'utilisateur ou email
            $users = User::where('id', '!=', $user->id)
                ->where(function($query) use ($search) {
                    $query->where('username', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                })
                ->whereNotIn('id', $existingFriendIds)
                ->limit($limit)
                ->get(['id', 'username', 'email', 'avatar']);
            
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la recherche d\'utilisateurs',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 