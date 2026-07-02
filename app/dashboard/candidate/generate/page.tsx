"use client";

import { useState } from "react";
import API_URL from "@/lib/api";

export default function GenerateResumePage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    location: "",
    school: "",
    college: "",
    degree: "",
    cgpa: "",
    graduation_year: "",
    technical_skills: "",
    soft_skills: "",
    experience: "",
    internships: "",
    projects: "",
    certifications: "",
    achievements: "",
    languages: "",
    hobbies: "",
    summary: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateResume = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");

      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      if (photo) {
        form.append("photo", photo);
      }

      const res = await fetch(
        `${API_URL}/api/resumes/build-resume-pdf/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) {
        alert("Failed to generate resume");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ATS_Resume.pdf";
      a.click();

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Generate ATS Resume</h1>

      <div className="grid grid-cols-2 gap-4">

        <input name="full_name" placeholder="Full Name" onChange={handleChange} className="input" />
        <input name="email" placeholder="Email" onChange={handleChange} className="input" />
        <input name="phone" placeholder="Phone" onChange={handleChange} className="input" />
        <input name="location" placeholder="Location" onChange={handleChange} className="input" />

        <input name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} className="input" />
        <input name="github" placeholder="GitHub URL" onChange={handleChange} className="input" />
        <input name="portfolio" placeholder="Portfolio URL" onChange={handleChange} className="input" />
        <input name="graduation_year" placeholder="Graduation Year" onChange={handleChange} className="input" />

        <input name="school" placeholder="School Name" onChange={handleChange} className="input" />
        <input name="college" placeholder="College Name" onChange={handleChange} className="input" />
        <input name="degree" placeholder="Degree" onChange={handleChange} className="input" />
        <input name="cgpa" placeholder="CGPA" onChange={handleChange} className="input" />

        <textarea name="summary" placeholder="Professional Summary" onChange={handleChange} className="input col-span-2" />

        <textarea name="technical_skills" placeholder="Technical Skills" onChange={handleChange} className="input col-span-2" />
        <textarea name="soft_skills" placeholder="Soft Skills" onChange={handleChange} className="input col-span-2" />

        <textarea name="experience" placeholder="Work Experience" onChange={handleChange} className="input col-span-2" />
        <textarea name="internships" placeholder="Internships" onChange={handleChange} className="input col-span-2" />
        <textarea name="projects" placeholder="Projects" onChange={handleChange} className="input col-span-2" />
        <textarea name="certifications" placeholder="Certifications" onChange={handleChange} className="input col-span-2" />
        <textarea name="achievements" placeholder="Achievements" onChange={handleChange} className="input col-span-2" />
        <textarea name="languages" placeholder="Languages" onChange={handleChange} className="input col-span-2" />
        <textarea name="hobbies" placeholder="Hobbies" onChange={handleChange} className="input col-span-2" />

        <div className="col-span-2">
          <label className="block mb-2 font-medium">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <button
        onClick={handleGenerateResume}
        className="mt-6 bg-green-500 text-white px-6 py-3 rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Resume"}
      </button>
    </div>
  );
}