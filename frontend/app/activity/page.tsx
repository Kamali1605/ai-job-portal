export default function ActivityPage() {
  const activities = [
    "Applied for Frontend Developer role",
    "Updated resume",
    "Viewed Backend Engineer job",
    "Logged in from a new device",
  ];

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Activity Log</h1>

      <ul className="space-y-4">
        {activities.map((activity, index) => (
          <li
            key={index}
            className="bg-white border-2 border-gray-300 rounded-lg p-5"
          >
            {activity}
          </li>
        ))}
      </ul>
    </div>
  );
}

