<?php

namespace App\Services;

use App\Models\PdfExport;
use App\Models\Quiz;
use App\Models\User;
use App\Models\QuizSession;
use App\Models\Participant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfExportService
{
    /**
     * Générer un PDF avec les résultats d'un quiz pour un utilisateur.
     *
     * @param User $user
     * @param Quiz $quiz
     * @param Participant $participant
     * @return PdfExport
     */
    public function generateResults(User $user, Quiz $quiz, Participant $participant): PdfExport
    {
        // Récupérer les données pour le PDF
        $quizData = $quiz->load('questions.answers');
        $participantAnswers = $participant->answers()->with(['question', 'answer'])->get();
        
        // Préparer les données pour la vue
        $data = [
            'user' => $user,
            'quiz' => $quizData,
            'participant' => $participant,
            'answers' => $participantAnswers,
            'totalQuestions' => $quizData->questions->count(),
            'correctAnswers' => $participantAnswers->filter(function ($answer) {
                return $answer->answer->revealIsCorrect();
            })->count(),
            'score' => $participant->score,
            'date' => now()->format('d/m/Y'),
        ];
        
        // Générer le PDF
        $pdf = PDF::loadView('pdf.results', $data);
        
        // Sauvegarder le fichier
        $filePath = PdfExport::generateFileName('results', $user->id, $quiz->id);
        Storage::put($filePath, $pdf->output());
        
        // Créer l'entrée dans la base de données
        return PdfExport::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'file_path' => $filePath,
            'type' => 'results',
        ]);
    }
    
    /**
     * Générer un certificat de réussite pour un utilisateur.
     *
     * @param User $user
     * @param Quiz $quiz
     * @param Participant $participant
     * @return PdfExport
     */
    public function generateCertificate(User $user, Quiz $quiz, Participant $participant): PdfExport
    {
        // Vérifier si l'utilisateur a réussi le quiz (critère : plus de 70% de bonnes réponses)
        $participantAnswers = $participant->answers()->with(['question', 'answer'])->get();
        $totalQuestions = $quiz->questions()->count();
        $correctAnswers = $participantAnswers->filter(function ($answer) {
            return $answer->answer->revealIsCorrect();
        })->count();
        
        $successRate = ($correctAnswers / $totalQuestions) * 100;
        
        // Préparer les données pour la vue
        $data = [
            'user' => $user,
            'quiz' => $quiz,
            'date' => now()->format('d/m/Y'),
            'successRate' => round($successRate, 2),
            'score' => $participant->score,
            'certificateNumber' => 'CERT-' . strtoupper(substr(md5($user->id . $quiz->id . time()), 0, 8)),
        ];
        
        // Générer le PDF
        $pdf = PDF::loadView('pdf.certificate', $data);
        $pdf->setPaper('a4', 'landscape');
        
        // Sauvegarder le fichier
        $filePath = PdfExport::generateFileName('certificate', $user->id, $quiz->id);
        Storage::put($filePath, $pdf->output());
        
        // Créer l'entrée dans la base de données
        return PdfExport::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'file_path' => $filePath,
            'type' => 'certificate',
        ]);
    }
    
    /**
     * Générer un rapport de progression pour un utilisateur.
     *
     * @param User $user
     * @return PdfExport
     */
    public function generateProgressReport(User $user): PdfExport
    {
        // Récupérer les données pour le rapport
        $participations = Participant::where('user_id', $user->id)
            ->with(['session.quiz', 'answers'])
            ->get();
        
        $quizzes = $participations->pluck('session.quiz')->unique('id');
        
        $quizStats = [];
        foreach ($quizzes as $quiz) {
            if (!$quiz) continue;
            
            $quizParticipations = $participations->filter(function ($part) use ($quiz) {
                return $part->session && $part->session->quiz_id === $quiz->id;
            });
            
            $totalAttempts = $quizParticipations->count();
            $bestScore = $quizParticipations->max('score');
            $averageScore = $quizParticipations->avg('score');
            
            $quizStats[] = [
                'quiz' => $quiz,
                'totalAttempts' => $totalAttempts,
                'bestScore' => $bestScore,
                'averageScore' => round($averageScore, 2),
            ];
        }
        
        // Préparer les données pour la vue
        $data = [
            'user' => $user,
            'quizStats' => $quizStats,
            'totalParticipations' => $participations->count(),
            'totalQuizzes' => $quizzes->count(),
            'date' => now()->format('d/m/Y'),
        ];
        
        // Générer le PDF
        $pdf = PDF::loadView('pdf.progress_report', $data);
        
        // Sauvegarder le fichier
        $filePath = PdfExport::generateFileName('report', $user->id);
        Storage::put($filePath, $pdf->output());
        
        // Créer l'entrée dans la base de données
        return PdfExport::create([
            'user_id' => $user->id,
            'file_path' => $filePath,
            'type' => 'report',
        ]);
    }
} 