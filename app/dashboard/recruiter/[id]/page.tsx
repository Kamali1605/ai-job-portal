"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API_URL from "@/lib/api";

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `${API_URL}/api/jobs/${jobId}/ranked/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setApplications(data || []);
    } catch (err) {
      console.error("Applicants fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchApplicants();
  }, [jobId]);

  const shortlistCandidate = async (applicationId: number) => {
    const token = localStorage.getItem("access");

    await fetch(
      `${API_URL}/api/jobs/${jobId}/shortlist/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ top_n: 1 }),
      }
    );

    fetchApplicants();
  };

  const rejectCandidate = async (applicationId: number) => {
    const token = localStorage.getItem("access");

    await fetch(
      `${API_URL}/api/jobs/${jobId}/reject/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ application_ids: [applicationId] }),
      }
    );   
    fetchApplicants();
  };
  if (loading) return <p className="p-10">Loading applicants...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      {applications.length === 0 ? (
        <p>No applicants yet</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.application_id}
              className="border p-4 rounded-lg shadow-sm"
            >
              <p className="font-semibold">
                Application ID: {app.application_id}
              </p>

              <p>ATS Score: {app.ats_score}</p>
              <p>Status: {app.status}</p>

              <p className="text-green-600">
                Skills Found: {app.skills_found?.join(", ")}
              </p>

              <p className="text-red-600">
                Missing Skills: {app.missing_skills?.join(", ")}
              </p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() =>
                    shortlistCandidate(app.application_id)
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Shortlist
                </button>

                <button
                  onClick={() =>
                    rejectCandidate(app.application_id)
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}