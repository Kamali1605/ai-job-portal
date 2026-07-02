"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/api/jobs/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => res.json())
      .then(setJobs);
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border rounded cursor-pointer hover:bg-gray-50"
            onClick={() =>
              router.push(`/dashboard/recruiter/jobs/${job.id}`)
            }
          >
            <h2 className="font-semibold">{job.title}</h2>
            <p className="text-sm text-gray-500">
              {job.description.slice(0, 100)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


