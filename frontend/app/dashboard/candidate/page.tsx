"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Application {
  job_title: string;
  status: string;
  ats_score: number;
  skills_found: string[];
  missing_skills: string[];
}

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        console.log("❌ NO TOKEN");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/resumes/candidate/dashboard/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        console.log("✅ DASHBOARD DATA:", data);

        // 🔥 IMPORTANT FIX
        if (data && Array.isArray(data.applications)) {
          setApplications(data.applications);
        } else {
          setApplications([]);
        }
      } catch (err) {
        console.log("❌ FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const total = applications.length;
  const applied = applications.filter((a) => a.status === "applied").length;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const chartData = [
    { name: "Applied", value: applied },
    { name: "Shortlisted", value: shortlisted },
    { name: "Rejected", value: rejected },
  ];

  if (loading) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">
        Candidate Dashboard
      </h1>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/dashboard/candidate/analyze")}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow"
        >
          Analyze Resume
        </button>

        <button
    onClick={() => router.push("/dashboard/candidate/generate")}
    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow"
  >
    Generate Resume
  </button>
</div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Applications" value={total} color="from-indigo-500 to-purple-500" />
        <StatCard title="Applied" value={applied} color="from-blue-500 to-cyan-500" />
        <StatCard title="Shortlisted" value={shortlisted} color="from-green-500 to-emerald-500" />
        <StatCard title="Rejected" value={rejected} color="from-red-500 to-pink-500" />
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Application Status Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value">
              <Cell fill="#3B82F6" />
              <Cell fill="#10B981" />
              <Cell fill="#EF4444" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* APPLICATIONS */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Recent Applications
        </h2>

        {applications.length === 0 ? (
          <p className="text-gray-500">No applications yet</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {applications.map((app, index) => (
              <ApplicationCard key={index} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg`}>
      <h2 className="text-sm opacity-90">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">{app.job_title}</h3>
        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
          {app.status}
        </span>
      </div>

      <p className="mt-3 text-sm">ATS Score: {app.ats_score}%</p>
    </div>
  );
}