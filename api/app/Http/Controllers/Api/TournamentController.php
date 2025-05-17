<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentParticipant;
use App\Models\TournamentRound;
use App\Models\TournamentMatch;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class TournamentController extends Controller
{
    /**
     * Affiche la liste des tournois.
     * Possibilité de filtrer par statut, par date ou par créateur.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Tournament::with('user');
        
        // Filtre par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filtre par période d'inscription active
        if ($request->has('registration_active') && $request->registration_active === 'true') {
            $now = Carbon::now();
            $query->where('registration_start', '<=', $now)
                  ->where('registration_end', '>=', $now);
        }
        
        // Filtre par créateur
        if ($request->has('creator_id')) {
            $query->where('creator_id', $request->creator_id);
        }
        
        // Filtre par tournois mis en avant
        if ($request->has('featured') && $request->featured === 'true') {
            $query->where('is_featured', true);
        }
        
        // Filtre par format
        if ($request->has('format')) {
            $query->where('format', $request->format);
        }
        
        // Tri par date de début par défaut
        $query->orderBy('start_date', 'desc');
        
        $tournaments = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $tournaments
        ]);
    }

    /**
     * Crée un nouveau tournoi.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        // Vérifier si l'utilisateur a les droits de créer un tournoi
        if (!$user->roles()->whereIn('name', ['admin', 'organizer'])->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour créer un tournoi'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'registration_start' => 'required|date',
            'registration_end' => 'required|date|after:registration_start',
            'start_date' => 'required|date|after_or_equal:registration_end',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_participants' => 'required|integer|min:2',
            'min_participants' => 'required|integer|min:2|lte:max_participants',
            'format' => 'required|string|in:single_elimination,double_elimination,round_robin,swiss',
            'rounds' => 'required|integer|min:1',
            'rules' => 'nullable|array',
            'prizes' => 'nullable|array',
            'banner_image' => 'nullable|string',
            'is_featured' => 'boolean',
            'require_approval' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Générer un code unique pour le tournoi
        $tournamentCode = Str::upper(Str::random(8));
        while (Tournament::where('tournament_code', $tournamentCode)->exists()) {
            $tournamentCode = Str::upper(Str::random(8));
        }
        
        // Créer le tournoi
        $data = $request->all();
        $data['creator_id'] = $user->id;
        $data['tournament_code'] = $tournamentCode;
        $data['status'] = 'pending'; // Statut initial
        
        $tournament = Tournament::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Tournoi créé avec succès',
            'data' => $tournament
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un tournoi spécifique avec ses participants et ses manches.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $tournament = Tournament::with(['user', 'tournament_participants.user', 'tournament_rounds.tournament_matches'])
            ->find($id);
        
        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tournoi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $tournament
        ]);
    }

    /**
     * Met à jour un tournoi spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $tournament = Tournament::find($id);
        
        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tournoi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a les droits de modifier ce tournoi
        if (!$user || (!$user->roles()->where('name', 'admin')->exists() && 
                       $tournament->creator_id !== $user->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour modifier ce tournoi'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Vérifier si le tournoi peut être modifié en fonction de son statut
        if ($tournament->status === 'active' || $tournament->status === 'completed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de modifier un tournoi actif ou terminé'
            ], Response::HTTP_CONFLICT);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'registration_start' => 'sometimes|required|date',
            'registration_end' => 'sometimes|required|date|after:registration_start',
            'start_date' => 'sometimes|required|date|after_or_equal:registration_end',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_participants' => 'sometimes|required|integer|min:2',
            'min_participants' => 'sometimes|required|integer|min:2|lte:max_participants',
            'format' => 'sometimes|required|string|in:single_elimination,double_elimination,round_robin,swiss',
            'rounds' => 'sometimes|required|integer|min:1',
            'rules' => 'nullable|array',
            'prizes' => 'nullable|array',
            'banner_image' => 'nullable|string',
            'status' => 'sometimes|required|string|in:pending,registration_open,registration_closed,active,completed,cancelled',
            'is_featured' => 'boolean',
            'require_approval' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $tournament->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Tournoi mis à jour avec succès',
            'data' => $tournament
        ]);
    }

    /**
     * Supprime un tournoi spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $tournament = Tournament::find($id);
        
        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tournoi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a les droits de supprimer ce tournoi
        if (!$user || (!$user->roles()->where('name', 'admin')->exists() && 
                       $tournament->creator_id !== $user->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour supprimer ce tournoi'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Vérifier si le tournoi est actif ou terminé
        if (in_array($tournament->status, ['active', 'completed'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer un tournoi actif ou terminé'
            ], Response::HTTP_CONFLICT);
        }
        
        DB::beginTransaction();
        try {
            // Supprimer les matches
            TournamentMatch::whereHas('tournament_round', function($query) use ($id) {
                $query->where('tournament_id', $id);
            })->delete();
            
            // Supprimer les manches
            TournamentRound::where('tournament_id', $id)->delete();
            
            // Supprimer les participants
            TournamentParticipant::where('tournament_id', $id)->delete();
            
            // Supprimer le tournoi
            $tournament->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tournoi supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression du tournoi',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Inscrit l'utilisateur courant au tournoi.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function register($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $tournament = Tournament::find($id);
        
        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tournoi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si les inscriptions sont ouvertes
        $now = Carbon::now();
        if ($now < $tournament->registration_start || $now > $tournament->registration_end) {
            return response()->json([
                'status' => 'error',
                'message' => 'Les inscriptions ne sont pas ouvertes pour ce tournoi'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Vérifier si le tournoi n'est pas complet
        $participantsCount = TournamentParticipant::where('tournament_id', $id)->count();
        if ($participantsCount >= $tournament->max_participants) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le tournoi est complet'
            ], Response::HTTP_CONFLICT);
        }
        
        // Vérifier si l'utilisateur n'est pas déjà inscrit
        $existingParticipant = TournamentParticipant::where('tournament_id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if ($existingParticipant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous êtes déjà inscrit à ce tournoi'
            ], Response::HTTP_CONFLICT);
        }
        
        // Créer l'inscription
        $participant = TournamentParticipant::create([
            'tournament_id' => $id,
            'user_id' => $user->id,
            'status' => $tournament->require_approval ? 'pending' : 'approved',
            'registered_at' => $now
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => $tournament->require_approval 
                ? 'Inscription en attente d\'approbation' 
                : 'Inscription réussie',
            'data' => $participant
        ]);
    }

    /**
     * Approuve ou rejette l'inscription d'un participant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $tournamentId
     * @param  int  $participantId
     * @return \Illuminate\Http\Response
     */
    public function approveParticipant(Request $request, $tournamentId, $participantId)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $tournament = Tournament::find($tournamentId);
        
        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tournoi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a les droits d'approuver des participants
        if (!$user->roles()->where('name', 'admin')->exists() && 
            $tournament->creator_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour approuver des participants'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $participant = TournamentParticipant::where('tournament_id', $tournamentId)
            ->where('id', $participantId)
            ->first();
            
        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Participant non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:approved,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        $participant->update([
            'status' => $request->status,
            'approved_at' => $request->status === 'approved' ? Carbon::now() : null
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => $request->status === 'approved' 
                ? 'Participant approuvé avec succès' 
                : 'Participant rejeté',
            'data' => $participant
        ]);
    }

    /**
     * Démarre un tournoi.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function startTournament($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $tournament = Tournament::with('tournament_participants')->find($id);
        
        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tournoi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a les droits de démarrer ce tournoi
        if (!$user->roles()->where('name', 'admin')->exists() && 
            $tournament->creator_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour démarrer ce tournoi'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Vérifier si le tournoi peut être démarré
        if ($tournament->status === 'active' || $tournament->status === 'completed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Le tournoi est déjà actif ou terminé'
            ], Response::HTTP_CONFLICT);
        }
        
        // Vérifier s'il y a assez de participants
        $approvedParticipants = $tournament->tournament_participants
            ->where('status', 'approved')
            ->count();
            
        if ($approvedParticipants < $tournament->min_participants) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pas assez de participants pour démarrer le tournoi',
                'required' => $tournament->min_participants,
                'current' => $approvedParticipants
            ], Response::HTTP_BAD_REQUEST);
        }
        
        DB::beginTransaction();
        try {
            // Mettre à jour le statut du tournoi
            $tournament->update([
                'status' => 'active'
            ]);
            
            // Générer les manches et matches selon le format
            // Ceci est une implémentation simplifiée pour un tournoi à élimination simple
            $participants = $tournament->tournament_participants
                ->where('status', 'approved')
                ->shuffle()
                ->values();
            
            // Créer la première manche
            $round = TournamentRound::create([
                'tournament_id' => $id,
                'round_number' => 1,
                'status' => 'active',
                'started_at' => Carbon::now()
            ]);
            
            // Créer les matches pour la première manche
            for ($i = 0; $i < $participants->count(); $i += 2) {
                if ($i + 1 < $participants->count()) {
                    TournamentMatch::create([
                        'tournament_round_id' => $round->id,
                        'player1_id' => $participants[$i]->user_id,
                        'player2_id' => $participants[$i + 1]->user_id,
                        'status' => 'pending',
                        'match_number' => ($i / 2) + 1
                    ]);
                } else {
                    // Si nombre impair, un joueur passe directement au tour suivant
                    TournamentMatch::create([
                        'tournament_round_id' => $round->id,
                        'player1_id' => $participants[$i]->user_id,
                        'player2_id' => null,
                        'status' => 'player1_win', // Victoire par forfait
                        'match_number' => ($i / 2) + 1
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tournoi démarré avec succès',
                'data' => Tournament::with(['tournament_rounds.tournament_matches'])->find($id)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors du démarrage du tournoi',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
