"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "@/lib/api";

interface DashboardData {
  total_jobs: number;
  total_applications: number;
  applied: number;
  shortlisted: number;
  rejected: number;
  recent_applications: { candidate_email: string; job_title: string; ats_score: number; status: string }[];
  top_candidates: { application_id: number; candidate_email: string; job_title: string; ats_score: number; status: string }[];
}

export default function RecruiterDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/resumes/recruiter/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid"></div>
      </div>
    );
  }

  if (!data) return <p className="p-10 text-center text-red-500 text-lg">Error loading dashboard.</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recruiter Overview</h1>
          <p className="text-gray-500 mt-2">Manage your job postings and applicants in one robust dashboard.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Link href="/dashboard/recruiter/jobs" className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
            Manage Jobs
          </Link>
          <Link href="/dashboard/recruiter/post-job" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Post a New Job
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Jobs" value={data.total_jobs} color="bg-blue-50 text-blue-700 border-blue-200" icon={<svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
        
        <StatCard title="Applications" value={data.total_applications} color="bg-indigo-50 text-indigo-700 border-indigo-200" icon={<svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        
        <StatCard title="Shortlisted" value={data.shortlisted} color="bg-emerald-50 text-emerald-700 border-emerald-200" icon={<svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>} />
        
        <StatCard title="Rejected" value={data.rejected} color="bg-rose-50 text-rose-700 border-rose-200" icon={<svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* RECENT APPLICATIONS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Recent Applications
            </h2>
          </div>
          <div className="p-0">
            {data.recent_applications.length === 0 ? (
              <p className="p-8 text-center text-gray-500 italic">No applications yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.recent_applications.map((app, idx) => (
                  <ApplicationRow key={idx} app={app} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* TOP CANDIDATES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-amber-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
               <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
               Top Candidates (High ATS Match)
            </h2>
          </div>
          <div className="p-0">
            {data.top_candidates.length === 0 ? (
              <p className="p-8 text-center text-gray-500 italic">No candidates scored yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.top_candidates.map((app, idx) => (
                  <ApplicationRow key={idx} app={app} highlight={true} />
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string, value: number, color: string, icon: React.ReactNode }) {
  return (
    <div className={`p-6 rounded-2xl border ${color} shadow-sm transition-transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-1 opacity-80">{title}</p>
          <h2 className="text-4xl font-extrabold">{value}</h2>
        </div>
        <div className="p-3 rounded-full bg-white bg-opacity-50 inline-block">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ApplicationRow({ app, highlight = false }: { app: any, highlight?: boolean }) {
  const statusColors: Record<string, string> = {
    applied: "bg-blue-100 text-blue-800 border-blue-200",
    shortlisted: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const statusClass = statusColors[app.status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <li className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[250px]">{app.candidate_email}</p>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium whitespace-nowrap ${statusClass}`}>
            {app.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          {app.job_title}
        </p>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">ATS Match</p>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${highlight ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                style={{ width: `${app.ats_score}%` }}
              ></div>
            </div>
            <span className={`font-bold text-sm ${highlight ? 'text-amber-700' : 'text-indigo-700'}`}>{app.ats_score}%</span>
          </div>
        </div>
      </div>
    </li>
  );
}
