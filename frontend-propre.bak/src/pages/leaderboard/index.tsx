import LeaderboardList from '../../components/leaderboard/LeaderboardList';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-8">Classement</h1>
      <LeaderboardList />
    </div>
  );
} 