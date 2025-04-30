'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      try {
        const response = await fetch(`/api/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Email Verification
        </h1>
        
        <div className="text-center">
          {status === 'verifying' && (
            <div className="animate-pulse">
              <div className="h-4 w-4 bg-indigo-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-600 dark:text-green-400">
              <svg
                className="h-12 w-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-lg font-medium">{message}</p>
              <a
                href="/auth/signin"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Sign In
              </a>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-600 dark:text-red-400">
              <svg
                className="h-12 w-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-lg font-medium">{message}</p>
              <a
                href="/auth/signin"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Return to Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 