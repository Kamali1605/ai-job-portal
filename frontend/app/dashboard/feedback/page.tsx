'use client';

import { useState } from 'react';
import API_URL from '@/lib/api';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('Please enter feedback');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('access');

      const res = await fetch(`${API_URL}/api/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('ERROR:', text);
        alert('Failed to submit feedback');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setMessage('');
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Server error');
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-12'>
      <h1 className='text-3xl font-bold mb-6'>Feedback</h1>

      {!submitted ? (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='w-full border-2 border-gray-300 rounded-lg p-4 h-32'
            placeholder='Share your feedback...'
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className='mt-4 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold'
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </>
      ) : (
        <p className='text-green-700 font-semibold'>
          Thank you for your feedback!
        </p>
      )}
    </div>
  );
}