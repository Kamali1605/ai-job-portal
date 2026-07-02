"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

export default function AnalyzeResumePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 FETCH JOBS
  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("access");

      const res = await fetch(`${API_URL}/api/jobs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data)) setJobs(data);
      else if (Array.isArray(data.results)) setJobs(data.results);
      else setJobs([]);
    };

    fetchJobs();
  }, []);

  // 🔹 ANALYZE RESUME
  const handleAnalyze = async () => {
    if (!resumeFile || !selectedJob) {
      alert("Upload resume and select job");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("access");

    const formData = new FormData();
    formData.append("resume_file", resumeFile);
    formData.append("job_id", selectedJob);

    try {
      const res = await fetch(
        `${API_URL}/api/resumes/analyze/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      setResult(data);

      // 🔥 CALL AI FEEDBACK API
      const feedbackRes = await fetch(
        `${API_URL}/api/resumes/ai-feedback/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_id: data.resume_id,
          }),
        }
      );

      const feedbackData = await feedbackRes.json();
      setAiFeedback(feedbackData);
    } catch (err) {
      console.log(err);
      alert("Error analyzing resume");
    }

    setLoading(false);
  };

  const resetForm = () => {
    setResult(null);
    setAiFeedback(null);
    setResumeFile(null);
    setSelectedJob("");
    setSelectedJobTitle("");
  };

  const ats = result?.ats_score ?? 0;
  const skillsFound = result?.skills_found?.length || 0;
  const keywordDensity = Math.min(100, skillsFound * 10);

  const sectionScores = [
    { name: "Skills Section", score: skillsFound * 12 },
    { name: "Projects", score: ats - 10 },
    { name: "Experience", score: ats - 15 },
    { name: "Education", score: ats - 20 },
  ];

  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // 🤖 FRONTEND AI SUGGESTIONS
  const generateSuggestions = () => {
    if (!result) return [];

    const suggestions: string[] = [];

    if (ats < 50) {
      suggestions.push("Add more job-specific keywords from the job description.");
      suggestions.push("Add measurable achievements (e.g., Improved API speed by 30%).");
    }

    if (result.missing_skills?.includes("django")) {
      suggestions.push("Add Django or Django REST Framework projects.");
    }

    if (result.missing_skills?.includes("git")) {
      suggestions.push("Mention Git and add your GitHub profile link.");
    }

    if (result.missing_skills?.includes("sql")) {
      suggestions.push("Add SQL database experience and queries.");
    }

    if (result.missing_skills?.includes("node")) {
      suggestions.push("Include backend projects using Node.js or Express.");
    }

    suggestions.push("Use action verbs like Developed, Built, Optimized.");
    suggestions.push("Keep resume length to one page.");
    suggestions.push("Add a strong summary at the top of your resume.");

    return suggestions;
  };

  const aiSuggestions = generateSuggestions();

  const resumeQuality =
    ats >= 80 ? "Excellent Resume" : ats >= 50 ? "Good Resume" : "Needs Improvement";

  return (
    <div className="p-10 max-w-7xl space-y-10">
      <h1 className="text-3xl font-bold">Analyze Your Resume</h1>

      {/* 🔹 UPLOAD FORM */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
        />

        <select
          value={selectedJob}
          onChange={(e) => {
            const jobId = e.target.value;
            setSelectedJob(jobId);

            const job = jobs.find((j: any) => j.id.toString() === jobId);
            setSelectedJobTitle(job?.title || "");
          }}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Job</option>
          {jobs.map((job: any) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <div className="flex gap-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {result && (
            <button
              onClick={resetForm}
              className="bg-gray-200 px-6 py-2 rounded-lg"
            >
              Analyze Another Resume
            </button>
          )}
        </div>
      </div>

      {/* 🔹 RESULTS */}
      {result && (
        <>
          <h2 className="text-2xl font-bold">{selectedJobTitle}</h2>

          {/* ATS + KEYWORD + QUALITY */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="ATS Score" value={`${ats}%`} progress={ats} />
            <Card title="Keyword Match" value={`${keywordDensity}%`} progress={keywordDensity} />
            <Card title="Resume Quality" value={resumeQuality} progress={ats} />
          </div>

          {/* SECTION SCORES */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6">
              Section-wise Resume Strength
            </h2>

            <div className="space-y-4">
              {sectionScores.map((section, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span>{section.name}</span>
                    <span>{Math.max(0, section.score)}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getColor(section.score)}`}
                      style={{ width: `${Math.max(0, section.score)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SKILLS FOUND */}
          <SkillBlock title="Skills Found" color="green" skills={result.skills_found} />

          {/* MISSING SKILLS */}
          <SkillBlock title="Missing Skills" color="red" skills={result.missing_skills} />

          {/* RECOMMENDED SKILLS */}
          {result.missing_skills?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
              <h3 className="font-semibold text-yellow-800 mb-3">
                Recommended Skills to Learn
              </h3>

              <ul className="list-disc list-inside space-y-1">
                {result.missing_skills.map((skill: string, i: number) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 🤖 FRONTEND AI SUGGESTIONS */}
          {aiSuggestions.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl">
              <h3 className="font-semibold text-indigo-800 mb-3">
                AI Resume Improvement Suggestions
              </h3>

              <ul className="list-disc list-inside space-y-2">
                {aiSuggestions.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 🤖 BACKEND AI FEEDBACK */}
          {aiFeedback && (
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl">
              <h3 className="font-semibold text-purple-800 mb-3">
                AI Resume Feedback
              </h3>

              <p className="mb-4 text-gray-700">{aiFeedback.summary}</p>

              <h4 className="font-semibold text-green-700">Strengths</h4>
              <ul className="list-disc list-inside mb-4">
                {aiFeedback.strengths?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <h4 className="font-semibold text-red-700">Improvements</h4>
              <ul className="list-disc list-inside mb-4">
                {aiFeedback.improvements?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <h4 className="font-semibold text-indigo-700">
                Recommended Jobs for You
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {aiFeedback.recommended_jobs?.map((job: any) => (
                  <span
                    key={job.id}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    {job.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  progress,
}: {
  title: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
        <div
          className="h-3 bg-indigo-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function SkillBlock({
  title,
  color,
  skills,
}: {
  title: string;
  color: "green" | "red";
  skills: string[];
}) {
  const bg =
    color === "green"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="font-semibold mb-3">{title}</h3>

      <div className="flex flex-wrap gap-2">
        {skills?.map((skill: string, i: number) => (
          <span key={i} className={`${bg} px-3 py-1 rounded-full text-sm`}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}