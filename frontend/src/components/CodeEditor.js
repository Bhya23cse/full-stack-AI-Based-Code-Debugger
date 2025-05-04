import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [debugResponse, setDebugResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEditorChange = (value) => {
    setCode(value);
    setError(''); // Clear error when code changes
  };

  const handleDebug = async () => {
    if (!code.trim()) {
      setError('Please enter some code to debug');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8000/debug', {
        code,
        language
      });
      
      if (response.data.status === 'error') {
        setError(response.data.debug_response);
        setDebugResponse('');
      } else {
        setDebugResponse(response.data.debug_response);
        setError('');
      }
    } catch (error) {
      console.error('Error debugging code:', error);
      setError(error.response?.data?.debug_response || 'Error occurred while debugging the code.');
      setDebugResponse('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor-container">
      <div className="editor-section">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="language-selector"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        
        <Editor
          height="400px"
          defaultLanguage={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        
        <button 
          onClick={handleDebug} 
          disabled={loading || !code.trim()}
          className="debug-button"
        >
          {loading ? 'Debugging...' : 'Debug Code'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}

      {debugResponse && (
        <div className="debug-output">
          <h3>Debug Results:</h3>
          <pre>{debugResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor; 