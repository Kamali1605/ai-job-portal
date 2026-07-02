"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `${API_URL}/api/jobs/my-jobs/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setJobs(data || []);
    } catch (err) {
      console.error("Jobs fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) return <p className="p-10">Loading jobs...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs posted yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() =>
                router.push(`/dashboard/recruiter/${job.id}`)
              }
              className="border p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
            >
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.description}</p>
              <p className="text-sm text-indigo-600 mt-2">
                Click to view applicants →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}