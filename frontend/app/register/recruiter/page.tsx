"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import API_URL from "@/lib/api";

export default function RecruiterRegister() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!company || !designation || !email || !password) {
      setError("Please fill all details");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/users/register/`,   // ✅ CORRECT API
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: company,   // ✅ company as username
            email: email,
            password: password,
            role: "recruiter",
          }),
        }
      );

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        setError(
          data?.username?.[0] ||
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.detail ||
          "Registration failed"
        );
        return;
      }

      alert("Registration successful ✅");
      router.push("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl border w-full max-w-md shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Recruiter Registration
        </h1>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Official Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}
