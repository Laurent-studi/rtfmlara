<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificat de Réussite</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            text-align: center;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .certificate {
            width: 100%;
            height: 100%;
            padding: 50px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        }
        .border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #8a6d3b;
            box-shadow: 0 0 0 5px #fff, 0 0 0 10px #8a6d3b;
            z-index: -1;
        }
        .content {
            padding: 40px;
        }
        .logo {
            margin-bottom: 30px;
        }
        .heading {
            font-size: 36px;
            color: #8a6d3b;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 5px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        .recipient {
            font-size: 28px;
            font-weight: bold;
            font-style: italic;
            color: #000;
            margin: 30px 0;
            border-bottom: 1px solid #8a6d3b;
            display: inline-block;
            padding: 0 30px 10px;
        }
        .description {
            font-size: 18px;
            max-width: 600px;
            margin: 0 auto 30px;
            line-height: 1.6;
        }
        .date {
            font-size: 18px;
            margin-top: 40px;
        }
        .signature {
            margin-top: 80px;
            display: flex;
            justify-content: space-around;
        }
        .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin-top: 10px;
            display: inline-block;
        }
        .signature-name {
            margin-top: 10px;
            font-weight: bold;
        }
        .signature-title {
            font-style: italic;
            font-size: 14px;
        }
        .certificate-number {
            position: absolute;
            bottom: 30px;
            right: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border"></div>
        <div class="content">
            <div class="heading">Certificat de Réussite</div>
            
            <div class="title">Ce certificat est décerné à</div>
            
            <div class="recipient">{{ $user->username }}</div>
            
            <div class="description">
                Pour avoir complété avec succès le quiz
                <strong>"{{ $quiz->title }}"</strong> 
                avec un taux de réussite de <strong>{{ $successRate }}%</strong> 
                et un score total de <strong>{{ $score }}</strong> points.
            </div>
            
            <div class="date">Délivré le {{ $date }}</div>
            
            <div class="signature">
                <div>
                    <div class="signature-line"></div>
                    <div class="signature-name">Admin RTFM</div>
                    <div class="signature-title">Administrateur</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div class="signature-name">{{ $quiz->creator->username ?? 'Créateur du Quiz' }}</div>
                    <div class="signature-title">Créateur du Quiz</div>
                </div>
            </div>
            
            <div class="certificate-number">Certificat N° {{ $certificateNumber }}</div>
        </div>
    </div>
</body>
</html> 