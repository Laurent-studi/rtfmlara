// Mock API pour les démonstrations
export const mockApiData = {
  'presentation/sessions/demo-session-123': {
    success: true,
    data: {
      session: {
        id: 'demo-session-123',
        status: 'pending',
        join_code: 'DEMO123',
        presenter_id: 1,
        quiz_id: 1,
        question_index: 0,
        total_questions: 10,
        quiz: {
          title: 'Quiz de Démonstration',
          time_per_question: 30,
          questions: Array(10).fill(null).map((_, i) => ({ id: i + 1 }))
        }
      },
      participants_count: 3,
      leaderboard: [
        {
          participant_id: 1,
          name: 'Alice Martin',
          user_id: 1,
          score: 0,
          joined_at: new Date(Date.now() - 60000).toISOString(),
          level: 15,
          badges: ['🏆', '⭐']
        },
        {
          participant_id: 2,
          name: 'Bob Dupont',
          user_id: 2,
          score: 0,
          joined_at: new Date(Date.now() - 30000).toISOString(),
          level: 8,
          badges: ['⭐']
        },
        {
          participant_id: 3,
          name: 'Charlie Leroy',
          user_id: 3,
          score: 0,
          joined_at: new Date(Date.now() - 15000).toISOString(),
          level: 12,
          badges: []
        }
      ]
    }
  },
  'presentation/sessions/21': {
    success: true,
    data: {
      session: {
        id: '21',
        status: 'pending',
        join_code: 'ABC123',
        presenter_id: 1,
        quiz_id: 1,
        question_index: 0,
        total_questions: 8,
        quiz: {
          title: 'Quiz Test Session 21',
          time_per_question: 30,
          questions: Array(8).fill(null).map((_, i) => ({ id: i + 1 }))
        }
      },
      participants_count: 2,
      leaderboard: [
        {
          participant_id: 1,
          name: 'Utilisateur Test',
          user_id: 1,
          score: 0,
          joined_at: new Date(Date.now() - 45000).toISOString(),
          level: 10,
          badges: ['⭐']
        },
        {
          participant_id: 2,
          name: 'Participant Anonyme',
          user_id: 2,
          score: 0,
          joined_at: new Date(Date.now() - 20000).toISOString(),
          level: 5,
          badges: []
        }
      ]
    }
  },
  'quizzes/1': {
    success: true,
    data: {
      id: 1,
      title: 'Quiz de Démonstration',
      description: 'Un quiz pour tester la nouvelle interface',
      time_per_question: 30,
      questions: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        text: `Question ${i + 1}`,
        multiple_answers: false
      }))
    }
  }
};

// Simuler des participants qui arrivent
let participantCount = 3;
const participantNames = [
  'Diana Prince', 'Ethan Hunt', 'Fiona Shaw', 'Gabriel Stone', 
  'Hannah Lee', 'Ivan Petrov', 'Julia Roberts', 'Kevin Hart'
];

export const addRandomParticipant = () => {
  if (participantCount < 8) {
    const newParticipant = {
      participant_id: participantCount + 1,
      name: participantNames[participantCount - 3],
      user_id: participantCount + 1,
      score: 0,
      joined_at: new Date().toISOString(),
      level: Math.floor(Math.random() * 20) + 1,
      badges: Math.random() > 0.5 ? ['⭐'] : []
    };
    
    mockApiData['presentation/sessions/demo-session-123'].data.leaderboard.push(newParticipant);
    mockApiData['presentation/sessions/demo-session-123'].data.participants_count = ++participantCount;
  }
};

// Simuler l'arrivée de participants toutes les 5 secondes
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (Math.random() > 0.7) {
      addRandomParticipant();
    }
  }, 5000);
} 