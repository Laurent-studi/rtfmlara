<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BattleRoyaleController extends Controller
{
    /**
     * Afficher la liste des sessions Battle Royale disponibles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $sessions = BattleRoyaleSession::with(['participants' => function($query) {
                $query->with('user:id,username,avatar');
            }])
            ->where(function($query) {
                $query->where('status', 'waiting')
                    ->orWhere(function($q) {
                        $q->where('status', 'active')
                            ->whereHas('participants', function($part) {
                                $part->where('user_id', Auth::id())
                                    ->whereNull('eliminated_at');
                            });
                    });
            })
            ->get();
        
        return response()->json($sessions);
    }

    /**
     * Afficher le détail d'une session Battle Royale.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $session = BattleRoyaleSession::with(['participants' => function($query) {
                $query->with('user:id,username,avatar')
                    ->orderBy('position', 'asc')
                    ->orderBy('score', 'desc');
            }])
            ->findOrFail($id);
        
        return response()->json($session);
    }

    /**
     * Créer une nouvelle session Battle Royale.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'max_players' => 'required|integer|min:2|max:50',
            'elimination_interval' => 'required|integer|min:30|max:300',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $session = new BattleRoyaleSession();
        $session->name = $request->name;
        $session->max_players = $request->max_players;
        $session->elimination_interval = $request->elimination_interval;
        $session->status = 'waiting';
        $session->save();
        
        // Créer un participant pour le créateur de la session
        $participant = new BattleRoyaleParticipant();
        $participant->session_id = $session->id;
        $participant->user_id = Auth::id();
        $participant->score = 0;
        $participant->save();
        
        return response()->json([
            'message' => 'Session Battle Royale créée avec succès',
            'session' => $session
        ], 201);
    }

    /**
     * Rejoindre une session Battle Royale existante.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function join($id)
    {
        $session = BattleRoyaleSession::findOrFail($id);
        
        // Vérifier si l'utilisateur peut rejoindre la session
        if (!$session->canJoin(Auth::id())) {
            return response()->json([
                'message' => 'Vous ne pouvez pas rejoindre cette session. Elle est peut-être pleine ou déjà commencée, ou vous y participez déjà.'
            ], 403);
        }
        
        // Créer un participant pour l'utilisateur
        $participant = new BattleRoyaleParticipant();
        $participant->session_id = $session->id;
        $participant->user_id = Auth::id();
        $participant->score = 0;
        $participant->save();
        
        // Notifier les autres participants
        $user = Auth::user();
        $otherParticipants = $session->participants()
            ->where('user_id', '!=', Auth::id())
            ->get();
        
        foreach ($otherParticipants as $otherParticipant) {
            Notification::create([
                'user_id' => $otherParticipant->user_id,
                'title' => 'Nouveau participant',
                'message' => "{$user->username} a rejoint la session Battle Royale \"{$session->name}\".",
                'type' => 'info'
            ]);
        }
        
        return response()->json([
            'message' => 'Vous avez rejoint la session Battle Royale avec succès',
            'session' => $session->load('participants.user')
        ]);
    }

    /**
     * Démarrer une session Battle Royale.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function start($id)
    {
        $session = BattleRoyaleSession::with('participants')->findOrFail($id);
        
        // Vérifier si l'utilisateur est le premier participant (créateur)
        $firstParticipant = $session->participants()->orderBy('id', 'asc')->first();
        if (!$firstParticipant || $firstParticipant->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Seul le créateur de la session peut la démarrer'
            ], 403);
        }
        
        // Vérifier s'il y a au moins 2 participants
        if ($session->participants()->count() < 2) {
            return response()->json([
                'message' => 'Il faut au moins 2 participants pour démarrer une session Battle Royale'
            ], 422);
        }
        
        // Démarrer la session
        if ($session->start()) {
            // Notifier tous les participants
            foreach ($session->participants as $participant) {
                Notification::create([
                    'user_id' => $participant->user_id,
                    'title' => 'Battle Royale commencé',
                    'message' => "La session Battle Royale \"{$session->name}\" a commencé ! Bonne chance !",
                    'type' => 'success'
                ]);
            }
            
            return response()->json([
                'message' => 'Session Battle Royale démarrée avec succès',
                'session' => $session->fresh(['participants.user'])
            ]);
        }
        
        return response()->json([
            'message' => 'Impossible de démarrer la session'
        ], 422);
    }

    /**
     * Soumettre une réponse dans le Battle Royale.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitAnswer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'answer_id' => 'required|integer|exists:answers,id',
            'response_time' => 'required|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $session = BattleRoyaleSession::findOrFail($id);
        
        // Vérifier si la session est active
        if ($session->status !== 'active') {
            return response()->json([
                'message' => 'Cette session n\'est pas active'
            ], 422);
        }
        
        // Vérifier si l'utilisateur est un participant non éliminé
        $participant = $session->participants()
            ->where('user_id', Auth::id())
            ->whereNull('eliminated_at')
            ->first();
        
        if (!$participant) {
            return response()->json([
                'message' => 'Vous n\'êtes pas un participant actif de cette session'
            ], 403);
        }
        
        // Récupérer la réponse
        $answer = Answer::find($request->answer_id);
        
        // Calculer les points en fonction de la réponse (correcte/incorrecte) et du temps de réponse
        $points = 0;
        if ($answer->revealIsCorrect()) {
            // Formule : plus le temps de réponse est court, plus les points sont élevés
            $maxPoints = 1000;
            $minPoints = 100;
            $maxTime = 30; // 30 secondes max pour répondre
            
            $responseTime = min($request->response_time, $maxTime);
            $points = $maxPoints - (($responseTime / $maxTime) * ($maxPoints - $minPoints));
            $points = max((int)$points, $minPoints);
        }
        
        // Ajouter les points au participant
        $participant->addPoints($points);
        
        return response()->json([
            'message' => $answer->revealIsCorrect() ? 'Bonne réponse !' : 'Mauvaise réponse.',
            'points_earned' => $points,
            'total_score' => $participant->score
        ]);
    }

    /**
     * Éliminer un participant du Battle Royale (timer d'élimination).
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function eliminate($id)
    {
        $session = BattleRoyaleSession::findOrFail($id);
        
        // Vérifier si la session est active
        if ($session->status !== 'active') {
            return response()->json([
                'message' => 'Cette session n\'est pas active'
            ], 422);
        }
        
        // Vérifier si l'utilisateur est le créateur
        $firstParticipant = $session->participants()->orderBy('id', 'asc')->first();
        if (!$firstParticipant || $firstParticipant->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Seul le créateur de la session peut éliminer des participants'
            ], 403);
        }
        
        // Éliminer le participant avec le score le plus bas
        $eliminated = $session->eliminateLowestScoreParticipant();
        
        if (!$eliminated) {
            return response()->json([
                'message' => 'Aucun participant à éliminer'
            ], 422);
        }
        
        // Charger l'utilisateur éliminé pour notification
        $eliminatedUser = User::find($eliminated->user_id);
        
        // Notifier tous les participants restants
        $aliveParticipants = $session->aliveParticipants()->get();
        
        foreach ($aliveParticipants as $aliveParticipant) {
            Notification::create([
                'user_id' => $aliveParticipant->user_id,
                'title' => 'Participant éliminé',
                'message' => "{$eliminatedUser->username} a été éliminé de la Battle Royale ! {$session->alive_count} participants restants.",
                'type' => 'warning'
            ]);
        }
        
        // Notifier l'utilisateur éliminé
        Notification::create([
            'user_id' => $eliminated->user_id,
            'title' => 'Vous avez été éliminé',
            'message' => "Vous avez été éliminé de la Battle Royale \"{$session->name}\" à la position {$eliminated->position}.",
            'type' => 'error'
        ]);
        
        // Vérifier si la session est terminée (un seul participant restant)
        if ($session->status === 'finished') {
            $winner = $session->participants()->where('position', 1)->first();
            $winnerUser = User::find($winner->user_id);
            
            // Notifier le gagnant
            Notification::create([
                'user_id' => $winner->user_id,
                'title' => 'Victoire !',
                'message' => "Félicitations ! Vous avez remporté la Battle Royale \"{$session->name}\" !",
                'type' => 'success'
            ]);
            
            // Notifier tous les participants de la fin
            foreach ($session->participants as $participant) {
                if ($participant->user_id !== $winner->user_id) {
                    Notification::create([
                        'user_id' => $participant->user_id,
                        'title' => 'Battle Royale terminé',
                        'message' => "La Battle Royale \"{$session->name}\" est terminée ! Le gagnant est {$winnerUser->username}.",
                        'type' => 'info'
                    ]);
                }
            }
        }
        
        return response()->json([
            'message' => $eliminatedUser->username . ' a été éliminé',
            'eliminated' => $eliminated->load('user'),
            'session_status' => $session->status,
            'alive_count' => $session->alive_count
        ]);
    }
}
