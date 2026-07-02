"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API_URL from "@/lib/api";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const id = params?.id;
        if (!id) return;

        const token = localStorage.getItem("access");
        const res = await fetch(`${API_URL}/api/jobs/${id}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [params?.id]);

  if (loading) return <p className="p-10 text-center text-lg">Loading job details...</p>;
  if (!job || job.error) return <p className="p-10 text-center text-red-500 text-lg">Job not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-6">
      <button 
        onClick={() => router.back()} 
        className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
      >
        &larr; Back to Jobs
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
        <p className="text-sm text-gray-400 mb-8">
          Posted on: {new Date(job.created_at).toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Job Description</h2>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-xl border border-gray-100">
          {job.description}
        </div>
      </div>
    </div>
  );
}
