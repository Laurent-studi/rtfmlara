<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rapport de Progression</title>
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
        .user-info {
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
        .quiz-section {
            margin-top: 30px;
        }
        .quiz-section h3 {
            color: #3490dc;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
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
        .chart {
            margin: 20px 0;
            width: 100%;
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
        }
        .progress-bar {
            height: 20px;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        .progress-value {
            height: 100%;
            background-color: #3490dc;
            text-align: center;
            color: white;
            line-height: 20px;
            font-size: 12px;
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
            <h1 class="title">Rapport de Progression</h1>
            <h2 class="user-info">{{ $user->username }}</h2>
        </div>
        
        <div class="summary">
            <h3>Résumé Global</h3>
            <p><strong>Nombre total de quiz:</strong> {{ $totalQuizzes }}</p>
            <p><strong>Nombre total de participations:</strong> {{ $totalParticipations }}</p>
            <p><strong>Date du rapport:</strong> {{ $date }}</p>
        </div>
        
        <div class="quiz-section">
            <h3>Détails par Quiz</h3>
            
            @if(count($quizStats) > 0)
                <table>
                    <thead>
                        <tr>
                            <th width="50%">Quiz</th>
                            <th width="15%">Tentatives</th>
                            <th width="15%">Meilleur score</th>
                            <th width="20%">Score moyen</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($quizStats as $stat)
                        <tr>
                            <td>{{ $stat['quiz']->title }}</td>
                            <td>{{ $stat['totalAttempts'] }}</td>
                            <td>{{ $stat['bestScore'] }}</td>
                            <td>{{ $stat['averageScore'] }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
                <div class="chart">
                    <h4>Meilleurs scores par quiz</h4>
                    @foreach($quizStats as $stat)
                        <div>
                            <p><strong>{{ $stat['quiz']->title }}</strong></p>
                            <div class="progress-bar">
                                @php
                                    // Calcul du pourcentage (supposons un score maximum de 10000)
                                    $maxPossibleScore = 10000;
                                    $percentage = min(100, ($stat['bestScore'] / $maxPossibleScore) * 100);
                                @endphp
                                <div class="progress-value" style="width: {{ $percentage }}%">
                                    {{ $stat['bestScore'] }}
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p>Aucune donnée de quiz disponible. Participez à des quiz pour voir vos statistiques ici.</p>
            @endif
        </div>
        
        <div class="footer">
            <p>Généré le {{ $date }} • RTFM Quiz System</p>
        </div>
    </div>
</body>
</html> 