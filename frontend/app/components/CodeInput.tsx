'use client';

import { useState } from 'react';

interface CodeInputProps {
  onSubmit: (code: string, language: string) => void;
  isLoading: boolean;
}

const CodeInput = ({ onSubmit, isLoading }: CodeInputProps) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code, language);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      
      <div className="mb-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          rows={10}
          className="w-full p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Analyzing...' : 'Analyze Code'}
      </button>
    </form>
  );
};

export default CodeInput; 