"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import API_URL from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fill all details");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      console.log("LOGIN RESPONSE:", data); // 🔍 debug

      // ✅ store JWT
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // ✅ store role correctly
      localStorage.setItem("role", data.user.role);

      // ✅ store user id
      localStorage.setItem("user_id", data.user.id.toString());

      // ✅ redirect based on role
      if (data.user.role === "recruiter") {
        router.push("/dashboard/recruiter");
      } else {
        router.push("/dashboard/candidate");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-6"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-3 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}