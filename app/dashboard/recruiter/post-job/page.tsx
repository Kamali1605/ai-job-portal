"use client";

import { useState } from "react";
import API_URL from "@/lib/api";

export default function PostJobPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("access");

    const res = await fetch(`${API_URL}/api/jobs/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 MUST
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    const data = await res.json(); // 👈 important

    if (!res.ok) {
      console.error("ERROR DATA:", data); // 🔥 see real error
      alert(JSON.stringify(data)); // 🔥 show exact issue
      return;
    }

    alert("Job created successfully ✅");
  } catch (err) {
    console.error(err);
    alert("Something went wrong ❌");
  }
};

  return (
    <div className="p-10 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Post a Job</h1>

      <input
        type="text"
        placeholder="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 mb-4 rounded"
      />

      <textarea
        placeholder="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-3 mb-4 rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-6 py-2 rounded"
      >
        Create Job
      </button>
    </div>
  );
}