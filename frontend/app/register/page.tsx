"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import API_URL from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !role) {
      setError("All fields required");
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
            username: email,   // backend requires username
            email: email,
            password: password,
            role: role,
          }),
        }
      );

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        setError(
          data?.email?.[0] ||
          data?.username?.[0] ||
          data?.password?.[0] ||
          data?.detail ||
          "Registration failed"
        );
        setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Email"
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

        <select
          className="w-full border p-3 rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>

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