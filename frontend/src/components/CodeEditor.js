import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [debugResponse, setDebugResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleDebug = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/debug', {
        code,
        language
      });
      setDebugResponse(response.data.debug_response);
    } catch (error) {
      console.error('Error debugging code:', error);
      setDebugResponse('Error occurred while debugging the code.');
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
          disabled={loading}
          className="debug-button"
        >
          {loading ? 'Debugging...' : 'Debug Code'}
        </button>
      </div>

      <div className="debug-output">
        <h3>Debug Results:</h3>
        <pre>{debugResponse}</pre>
      </div>
    </div>
  );
};

export default CodeEditor; 