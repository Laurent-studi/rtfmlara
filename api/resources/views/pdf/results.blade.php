<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Résultats du Quiz</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3490dc;
            padding-bottom: 10px;
        }
        .title {
            color: #3490dc;
            font-size: 24px;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 18px;
            color: #666;
            margin-top: 0;
        }
        .summary {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .summary h3 {
            margin-top: 0;
            color: #3490dc;
        }
        .details {
            margin-top: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .correct {
            color: #38c172;
        }
        .incorrect {
            color: #e3342f;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Résultats du Quiz</h1>
            <h2 class="subtitle">{{ $quiz->title }}</h2>
        </div>
        
        <div class="summary">
            <h3>Résumé</h3>
            <p><strong>Participant:</strong> {{ $user->username }}</p>
            <p><strong>Date:</strong> {{ $date }}</p>
            <p><strong>Score total:</strong> {{ $score }} points</p>
            <p><strong>Questions correctes:</strong> {{ $correctAnswers }} / {{ $totalQuestions }}</p>
            <p><strong>Pourcentage de réussite:</strong> {{ round(($correctAnswers / $totalQuestions) * 100, 2) }}%</p>
        </div>
        
        <div class="details">
            <h3>Détails des réponses</h3>
            
            <table>
                <thead>
                    <tr>
                        <th width="40%">Question</th>
                        <th width="40%">Votre réponse</th>
                        <th width="20%">Résultat</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($answers as $answer)
                    <tr>
                        <td>{{ $answer->question->question_text }}</td>
                        <td>{{ $answer->answer->answer_text }}</td>
                        <td class="{{ $answer->answer->revealIsCorrect() ? 'correct' : 'incorrect' }}">
                            {{ $answer->answer->revealIsCorrect() ? 'Correct' : 'Incorrect' }}
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Généré le {{ $date }} • RTFM Quiz System</p>
        </div>
    </div>
</body>
</html> 