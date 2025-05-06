import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [debugResponse, setDebugResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const editorRef = useRef(null);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const placeholder = 'Type or paste your code here to debug...';
  const decorationIdsRef = useRef([]);

  const handleEditorChange = (value) => {
    setCode(value);
    setError('');
    setIsPlaceholderVisible(value.trim() === '' || value === placeholder);
  };

  const applyPlaceholderDecoration = (editor) => {
    const model = editor.getModel();
    decorationIdsRef.current = editor.deltaDecorations([], [
      {
        range: new window.monaco.Range(1, 1, 1, placeholder.length + 1),
        options: {
          inlineClassName: 'placeholder-text',
        },
      },
    ]);
  };

  const removePlaceholderDecoration = (editor) => {
    editor.deltaDecorations(decorationIdsRef.current, []);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    const model = editor.getModel();

    if (!code && model.getValue() === '') {
      model.setValue(placeholder);
      setCode(placeholder);
      applyPlaceholderDecoration(editor);
      editor.setPosition({ lineNumber: 1, column: 1 });
    }

    editor.onDidFocusEditorText(() => {
      if (model.getValue() === placeholder) {
        model.setValue('');
        removePlaceholderDecoration(editor);
      }
    });

    editor.onDidBlurEditorText(() => {
      if (model.getValue().trim() === '') {
        model.setValue(placeholder);
        setCode(placeholder);
        applyPlaceholderDecoration(editor);
        editor.setPosition({ lineNumber: 1, column: 1 });
      }
    });
  };

  const handleDebug = async () => {
    const cleanCode = code.trim() === placeholder ? '' : code.trim();

    if (!cleanCode) {
      setError('Please enter some code to debug');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8000/debug', {
        code: cleanCode,
        language,
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
      setError(
        error.response?.data?.debug_response ||
          'Error occurred while debugging the code.'
      );
      setDebugResponse('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor-container">
      <style>
        {`
          .placeholder-text {
            color: #00ff00 !important; /* green */
            font-style: italic;
          }
        `}
      </style>

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
          height="300px"
          defaultLanguage={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />

        <button
          onClick={handleDebug}
          disabled={loading || !code.trim() || code === placeholder}
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
