"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import API_URL from "@/lib/api";

export default function CandidateRegister() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill all details");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/register/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    username: name,
    password,
    role: "candidate",
  }),
});

      const data = await res.json();

      if (!res.ok) {
        setError("Registration failed");
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Candidate Registration</h1>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white py-3 rounded font-semibold"
        >
          Register
        </button>
      </div>
    </div>
  );
}