"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

const steps = ["applied", "shortlisted", "rejected"];
const filters = ["all", "applied", "shortlisted", "rejected"];

interface Application {
  job_title: string;
  status: string;
  ats_score: number;
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchApplications = async (url?: string, filter?: string) => {
    try {
      const token = localStorage.getItem("access");

      let apiUrl = url;

      if (!apiUrl) {
        apiUrl = `${API_URL}/api/resumes/my-applications/`;

        if (filter && filter !== "all") {
          apiUrl += `?status=${filter}`;
        }
      }

      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setApplications(data.results);
      setCount(data.count);
      setNextUrl(data.next);
      setPrevUrl(data.previous);
      setLoading(false);
    } catch (error) {
      console.log("Fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(undefined, selectedFilter);
  }, [selectedFilter]);

  const StatusTimeline = ({ status }: { status: string }) => {
    const currentIndex = steps.indexOf(status);

    return (
      <div className="flex items-center gap-4 mt-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${
                index <= currentIndex ? "bg-black" : "bg-gray-300"
              }`}
            />
            <span
              className={`text-sm capitalize ${
                index <= currentIndex
                  ? "font-semibold text-black"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-10">Loading applications...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">
        My Applications ({count})
      </h1>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded ${
              selectedFilter === filter
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {applications.length === 0 && (
        <p className="text-gray-600">No applications found</p>
      )}

      <div className="space-y-6">
        {applications.map((app, i) => (
          <div key={i} className="border rounded-lg p-6 bg-white shadow">
            <h3 className="text-lg font-semibold">{app.job_title}</h3>

            <StatusTimeline status={app.status} />

            <p className="mt-4 text-sm font-medium">
              ATS Score: {app.ats_score}%
            </p>

            <div className="w-full bg-gray-200 rounded h-3 mt-1">
              <div
                className="bg-blue-500 h-3 rounded"
                style={{ width: `${app.ats_score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => prevUrl && fetchApplications(prevUrl)}
          disabled={!prevUrl}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => nextUrl && fetchApplications(nextUrl)}
          disabled={!nextUrl}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}