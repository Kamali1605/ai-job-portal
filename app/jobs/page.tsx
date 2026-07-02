"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await fetch(`${API_URL}/api/jobs/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("JOBS:", data);

        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});

  const handleFileChange = (jobId: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [jobId]: file }));
  };

  const handleApply = async (job: any) => {
    const file = selectedFiles[job.id];
    if (!file) {
      alert("⚠️ Please upload a resume first.");
      return;
    }

    try {
      const token = localStorage.getItem("access");

      // 1. Upload Resume
      const formData = new FormData();
      formData.append("resume_file", file);
      formData.append("job_id", job.id);

      const uploadRes = await fetch(`${API_URL}/api/resumes/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        alert("❌ Error uploading resume: " + JSON.stringify(uploadData));
        return;
      }

      const resumeId = uploadData.resume_id;

      // 2. Apply for Job
      const applyRes = await fetch(`${API_URL}/api/jobs/apply-job/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: job.id,
          resume_id: resumeId,
        }),
      });

      const applyData = await applyRes.json();

      if (applyRes.ok) {
        alert("✅ Applied! ATS Score: " + applyData.ats_score);
      } else {
        alert("❌ Error applying: " + JSON.stringify(applyData));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong");
    }
  };

  if (loading) return <p className="p-10">Loading jobs...</p>;

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-6">
      <h1 className="text-3xl font-bold">Available Jobs</h1>

      {jobs.length === 0 && <p>No jobs available</p>}

      {jobs.map((job) => (
        <div
          key={job.id}
          className="border p-6 rounded-xl hover:shadow space-y-3"
        >
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p className="text-gray-600">{job.description}</p>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Resume:</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(job.id, e.target.files ? e.target.files[0] : null)}
                className="text-sm border p-1 rounded"
              />
            </div>
            
            <div className="flex gap-3">
              {/* View Details */}
              <Link
                href={`/jobs/${job.id}`}
                className="bg-gray-200 px-4 py-2 rounded text-center"
              >
                View
              </Link>

              {/* Apply Button */}
              <button
                onClick={() => handleApply(job)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}