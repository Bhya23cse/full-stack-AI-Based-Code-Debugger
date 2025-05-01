import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaRobot, FaLightbulb } from 'react-icons/fa';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Debug Your Code with AI
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Get instant feedback and suggestions for your code using advanced AI technology
          </p>
          <button
            onClick={() => navigate('/debugger')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
          >
            Start Debugging
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <FaCode className="text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Analysis</h3>
            <p className="text-gray-300">
              Advanced AI-powered code analysis to identify bugs and issues
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <FaRobot className="text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Real-time Debug</h3>
            <p className="text-gray-300">
              Get instant feedback and suggestions as you code
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <FaLightbulb className="text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
            <p className="text-gray-300">
              Simple interface with powerful debugging capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 AI Code Debugger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage; 