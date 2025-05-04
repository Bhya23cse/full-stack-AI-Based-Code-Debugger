import React from 'react';
import CodeEditor from './components/CodeEditor';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Code Debugger</h1>
        <p>Powered by Gemini AI</p>
      </header>
      <main>
        <CodeEditor />
      </main>
    </div>
  );
}

export default App;
