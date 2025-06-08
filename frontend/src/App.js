import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import './App.css';

const Home = () => {
  const navigate = useNavigate();

  const handleStartDebugging = () => {
    navigate('/debug');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Based-Code Debugger</h1>
      </header>
      <main className="App-main">
        <p>Welcome to your personal AI-powered debugging tool!</p>
        <button className="start-button" onClick={handleStartDebugging}>
          Let's Start Debugging
        </button>
      </main>
      <footer className="App-footer">
        <h1>AI Code Debugger</h1>
        <p>Powered by Gemini AI</p>
        <p>© 2025 AI-based-code-debugger All rights reserved | Terms of Service | Privacy Policy</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/debug" element={<CodeEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
