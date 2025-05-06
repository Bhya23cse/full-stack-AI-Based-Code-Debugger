import React from 'react';
import CodeEditor from './components/CodeEditor';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Based-Code Debugger</h1>
      </header>
      <main>
        <CodeEditor />
      </main>
      <footer className="App-footer">
        <h1>AI Code Debugger</h1>
        <p>Powered by Gemini AI</p>
        <p>© 2025 AI-based-code-debugger All rights reserved | Terms of Service | Privacy Policy</p>
      </footer>
    </div>
  );
}

export default App;
