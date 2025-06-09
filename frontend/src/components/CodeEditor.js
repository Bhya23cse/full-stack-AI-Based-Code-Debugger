import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

// Add error handler for ResizeObserver
const ignoreResizeObserverError = () => {
  const resizeObserverError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.("ResizeObserver loop")) {
      return;
    }
    resizeObserverError(...args);
  };
};

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [debugResponse, setDebugResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [debugHistory, setDebugHistory] = useState([]);
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const placeholder = "Type or paste your code here to debug...";
  const decorationIdsRef = useRef([]);

  // Add ResizeObserver error handler
  useEffect(() => {
    ignoreResizeObserverError();
  }, []);

  // Improved resize handling with debounce
  useEffect(() => {
    if (editorRef.current && editorContainerRef.current) {
      const handleResize = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = setTimeout(() => {
          if (editorRef.current) {
            const container = editorContainerRef.current;
            const containerWidth = container.getBoundingClientRect().width;
            container.style.maxWidth = `${containerWidth}px`;
            editorRef.current.layout();
          }
        }, 100);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(editorContainerRef.current);

      return () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        resizeObserver.disconnect();
      };
    }
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    setError("");
  };

  const applyPlaceholderDecoration = (editor) => {
    decorationIdsRef.current = editor.deltaDecorations(
      [],
      [
        {
          range: new window.monaco.Range(1, 1, 1, placeholder.length + 1),
          options: {
            inlineClassName: "placeholder-text",
          },
        },
      ]
    );
  };

  const removePlaceholderDecoration = (editor) => {
    editor.deltaDecorations(decorationIdsRef.current, []);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    const model = editor.getModel();

    // Configure editor for better performance and layout
    editor.getModel().setEOL(0); // LF
    editor.updateOptions({
      renderWhitespace: "none",
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      fixedOverflowWidgets: true, // Prevent widgets from expanding the editor
      automaticLayout: false, // We'll handle layout manually
    });

    // Set initial width constraint
    const container = editorContainerRef.current;
    if (container) {
      const containerWidth = container.getBoundingClientRect().width;
      container.style.maxWidth = `${containerWidth}px`;
      editor.layout();
    }

    if (!code && model.getValue() === "") {
      model.setValue(placeholder);
      setCode(placeholder);
      applyPlaceholderDecoration(editor);
      editor.setPosition({ lineNumber: 1, column: 1 });
    }

    editor.onDidFocusEditorText(() => {
      if (model.getValue() === placeholder) {
        model.setValue("");
        removePlaceholderDecoration(editor);
      }
    });

    editor.onDidBlurEditorText(() => {
      if (model.getValue().trim() === "") {
        model.setValue(placeholder);
        setCode(placeholder);
        applyPlaceholderDecoration(editor);
        editor.setPosition({ lineNumber: 1, column: 1 });
      }
    });
  };

  const handleDebug = async () => {
    const cleanCode = code.trim() === placeholder ? "" : code.trim();

    if (!cleanCode) {
      setError("Please enter some code to debug");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://localhost:8000/debug", {
        code: cleanCode,
        language,
      });

      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        language,
        code: cleanCode,
        response: response.data.debug_response,
        error:
          response.data.status === "error"
            ? response.data.debug_response
            : null,
      };
      setDebugHistory((prev) => [historyItem, ...prev]);

      if (response.data.status === "error") {
        setError(response.data.debug_response);
        setDebugResponse("");
      } else {
        setDebugResponse(response.data.debug_response);
        setError("");
      }
    } catch (error) {
      console.error("Error debugging code:", error);
      const errorMessage =
        error.response?.data?.debug_response ||
        "Error occurred while debugging the code.";
      setError(errorMessage);
      setDebugResponse("");

      // Add error to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        language,
        code: cleanCode,
        error: errorMessage,
      };
      setDebugHistory((prev) => [historyItem, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setCode(item.code);
    setLanguage(item.language);
    setDebugResponse(item.response || "");
    setError(item.error || "");
  };

  return (
    <div className="code-editor-container">
      <style>
        {`
          .placeholder-text {
            color: rgb(124, 124, 124) !important;
            font-style: italic;
          }
        `}
      </style>

      <div className="main-content">
        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <pre>{error}</pre>
          </div>
        )}

        {debugResponse && (
          <div className="debug-output">
            <h3>Debug Results:</h3>
            <div
              className="debug-content"
              dangerouslySetInnerHTML={{ __html: debugResponse }}
            />
          </div>
        )}
      </div>
      <div className="editor-section" ref={editorContainerRef}>
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

        <div className="editor-wrapper">
          <Editor
            height="400px"
            defaultLanguage={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            loading={<div className="editor-loading">Loading editor...</div>}
            options={{
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>

        <button
          onClick={handleDebug}
          disabled={loading || !code.trim() || code === placeholder}
          className="debug-button"
        >
          {loading ? "Debugging..." : "Debug Code"}
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
