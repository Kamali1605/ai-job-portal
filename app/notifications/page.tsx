export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "New Job Match",
      message: "A Software Developer role matches your profile.",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Application Viewed",
      message: "Your application was viewed by HR.",
      time: "Yesterday",
    },
    {
      id: 3,
      title: "Profile Incomplete",
      message: "Update your resume to improve visibility.",
      time: "2 days ago",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>

      <div className="space-y-6">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white border-2 border-gray-300 rounded-xl p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{n.title}</h2>
              <span className="text-sm text-gray-500">{n.time}</span>
            </div>
            <p className="text-gray-700 mt-2">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


