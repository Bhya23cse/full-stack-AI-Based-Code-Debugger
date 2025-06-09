import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import './App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo">AI Debug</span>
      </div>
      <div className="navbar-links">
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
      </div>
    </nav>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartDebugging = () => {
    navigate('/debug');
  };

  return (
    <div className="App">
      <Navbar />
      <main className="hero-section">
        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <h1 className="hero-title">
            Debug Smarter, <span className="highlight">Not Harder</span>
          </h1>
          <p className="hero-subtitle">
            Your AI-powered debugging companion that helps you find and fix bugs faster than ever
          </p>
          <button className="cta-button" onClick={handleStartDebugging}>
            Start Debugging
            <span className="button-arrow">→</span>
          </button>
        </div>
        
        <section id="features" className="features-section">
          <h2>Why Choose AI Debug?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced algorithms to detect and analyze code issues</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-Time Debugging</h3>
              <p>Get instant feedback and suggestions as you code</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Precise Solutions</h3>
              <p>Accurate and context-aware bug fixing recommendations</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AI Code Debugger</h3>
            <p>Making debugging smarter and faster</p>
          </div>
          <div className="footer-section">
            <p>© 2025 AI Debug. All rights reserved.</p>
            <div className="footer-links">
              <a href="#terms">Terms of Service</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
          </div>
        </div>
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
