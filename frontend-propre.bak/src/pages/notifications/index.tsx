import NotificationList from '../../components/notification/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-8">Mes notifications</h1>
      <NotificationList />
    </div>
  );
} 