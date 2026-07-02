"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Feedback</h1>

      {!submitted ? (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your feedback..."
            className="w-full border-2 border-gray-300 rounded-lg p-4 h-32"
          />

          <button
            onClick={() => setSubmitted(true)}
            className="mt-4 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Submit Feedback
          </button>
        </>
      ) : (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6">
          <p className="font-semibold text-green-800">
            Thank you for your feedback!
          </p>
        </div>
      )}
    </div>
  );
}

