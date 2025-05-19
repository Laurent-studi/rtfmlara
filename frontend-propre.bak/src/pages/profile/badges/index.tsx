import BadgeList from '../../../components/badge/BadgeList';

export default function ProfileBadgesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-8">Mes badges</h1>
      <BadgeList />
    </div>
  );
} 