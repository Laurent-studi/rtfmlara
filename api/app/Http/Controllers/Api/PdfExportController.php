<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PdfExport;
use App\Models\Quiz;
use App\Models\Participant;
use App\Models\QuizSession;
use App\Services\PdfExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class PdfExportController extends Controller
{
    protected $pdfService;

    /**
     * Constructeur du contrôleur.
     *
     * @param PdfExportService $pdfService
     */
    public function __construct(PdfExportService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Afficher la liste des exports PDF de l'utilisateur.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $exports = PdfExport::with('quiz')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json($exports);
    }

    /**
     * Générer un PDF des résultats d'un quiz.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateResults(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'session_id' => 'required|integer|exists:quiz_sessions,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Vérifier la session et le participant
        $session = QuizSession::findOrFail($request->session_id);
        $participant = Participant::where('session_id', $session->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$participant) {
            return response()->json([
                'message' => 'Vous n\'avez pas participé à cette session de quiz'
            ], 403);
        }
        
        // Vérifier que le quiz correspond à la session
        if ($session->quiz_id != $request->quiz_id) {
            return response()->json([
                'message' => 'La session ne correspond pas au quiz spécifié'
            ], 422);
        }
        
        // Générer le PDF des résultats
        $export = $this->pdfService->generateResults(Auth::user(), Quiz::find($request->quiz_id), $participant);
        
        return response()->json([
            'message' => 'PDF des résultats généré avec succès',
            'export' => $export
        ]);
    }

    /**
     * Générer un certificat pour un quiz.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateCertificate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'session_id' => 'required|integer|exists:quiz_sessions,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Vérifier la session et le participant
        $session = QuizSession::findOrFail($request->session_id);
        $participant = Participant::where('session_id', $session->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$participant) {
            return response()->json([
                'message' => 'Vous n\'avez pas participé à cette session de quiz'
            ], 403);
        }
        
        // Vérifier que le quiz correspond à la session
        if ($session->quiz_id != $request->quiz_id) {
            return response()->json([
                'message' => 'La session ne correspond pas au quiz spécifié'
            ], 422);
        }
        
        // Vérifier si l'utilisateur a réussi le quiz (critère : plus de 70%)
        $quiz = Quiz::findOrFail($request->quiz_id);
        $participantAnswers = $participant->answers()->with(['question', 'answer'])->get();
        $totalQuestions = $quiz->questions()->count();
        $correctAnswers = $participantAnswers->filter(function ($answer) {
            return $answer->answer->revealIsCorrect();
        })->count();
        
        $successRate = ($correctAnswers / $totalQuestions) * 100;
        
        if ($successRate < 70) {
            return response()->json([
                'message' => 'Vous n\'avez pas atteint le seuil de réussite de 70% pour obtenir un certificat',
                'success_rate' => round($successRate, 2)
            ], 422);
        }
        
        // Générer le certificat
        $export = $this->pdfService->generateCertificate(Auth::user(), $quiz, $participant);
        
        return response()->json([
            'message' => 'Certificat généré avec succès',
            'export' => $export
        ]);
    }

    /**
     * Générer un rapport de progression.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateProgressReport()
    {
        // Générer le rapport de progression
        $export = $this->pdfService->generateProgressReport(Auth::user());
        
        return response()->json([
            'message' => 'Rapport de progression généré avec succès',
            'export' => $export
        ]);
    }

    /**
     * Télécharger un PDF existant.
     *
     * @param int $id
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function download($id)
    {
        $export = PdfExport::where('user_id', Auth::id())->findOrFail($id);
        
        if (!$export->fileExists()) {
            return response()->json([
                'message' => 'Le fichier PDF n\'existe pas'
            ], 404);
        }
        
        $path = $export->getFullPath();
        $filename = basename($path);
        
        return Response::download($path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Supprimer un export PDF.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $export = PdfExport::where('user_id', Auth::id())->findOrFail($id);
        $export->delete();
        
        return response()->json([
            'message' => 'Export PDF supprimé avec succès'
        ]);
    }


    public function show(\App\Models\PdfExport $pdfExport)
    {
        return view('pdf-exports.show', compact('pdfExport'));
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'quiz_id' => 'required',
            'file_path' => 'required',
            'type' => 'required'
        ]);

        \App\Models\PdfExport::create($validated);

        return redirect()->route('pdf-exports.index');
    }


    public function update(Request $request, \App\Models\PdfExport $pdfExport)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'quiz_id' => 'required',
            'file_path' => 'required',
            'type' => 'required'
        ]);

        $pdfExport->update($validated);

        return redirect()->route('pdf-exports.index');
    }
}