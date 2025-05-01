import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FaUser, FaHistory, FaTrash, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Debugger() {
  const [code, setCode] = useState('// Write your code here\nfunction example() {\n  console.log("Hello World");\n}');
  const [language, setLanguage] = useState('javascript');
  const [darkMode, setDarkMode] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const editorRef = useRef(null);

  // Backend URL configuration
  const BACKEND_URL = 'http://127.0.0.1:5000';

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // Reset code based on language
    const defaultCodes = {
      javascript: '// Write your JavaScript code here\nfunction example() {\n  console.log("Hello World");\n}',
      python: '# Write your Python code here\ndef example():\n    print("Hello World")',
      java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
      cpp: '// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}'
    };
    setCode(defaultCodes[e.target.value] || defaultCodes.javascript);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const data = await response.json();
      setAnalysis(data);
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        code,
        language,
        analysis: data,
        timestamp: new Date().toLocaleString()
      }, ...prev]);

      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast.error('Failed to analyze code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  const handleLoadFromHistory = (item) => {
    setCode(item.code);
    setLanguage(item.language);
    setAnalysis(item.analysis);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800 sticky top-0 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700"
        >
          <FaBars className="text-xl" />
        </button>
        <select
          value={language}
          onChange={handleLanguageChange}
          className={`w-48 p-2 rounded-lg ${
            darkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-900 border-gray-300'
          } border`}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Sidebar - Mobile Sliding Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-700">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaUser className="text-white text-xl" />
            </div>
            <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Proc</span>
          </div>

          {/* History Section */}
          <div className="flex-1 mb-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>History</h3>
              {history.length > 0 && (
                <button onClick={handleClearHistory}>
                  <FaTrash className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    handleLoadFromHistory(item);
                    setSidebarOpen(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-gray-700 bg-gray-700/50 text-gray-300' 
                      : 'hover:bg-gray-200 bg-gray-200/50 text-gray-700'
                  }`}
                >
                  <div>Example</div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 max-w-7xl">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 lg:gap-6">
          {/* Desktop Sidebar */}
          <div className={`hidden lg:block col-span-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 lg:p-6 h-fit sticky top-20`}>
            {/* User Info */}
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
              <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Proc</span>
            </div>

            {/* History Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>History</h3>
                {history.length > 0 && (
                  <button onClick={handleClearHistory}>
                    <FaTrash className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleLoadFromHistory(item)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      darkMode 
                        ? 'hover:bg-gray-700 bg-gray-700/50 text-gray-300' 
                        : 'hover:bg-gray-200 bg-gray-200/50 text-gray-700'
                    }`}
                  >
                    <div>Example</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 lg:gap-6">
              {/* Code Editor Section */}
              <div className="col-span-12 lg:col-span-6">
                <div className="hidden lg:block mb-4">
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className={`w-full p-2.5 sm:p-3 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-800 text-white border-gray-700' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border`}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg overflow-hidden`}>
                  <Editor
                    height={window.innerWidth < 640 ? "300px" : "400px"}
                    defaultLanguage={language}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={darkMode ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: window.innerWidth < 640 ? 12 : 14,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`mt-4 w-full p-2.5 sm:p-3 rounded-lg font-medium transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800/50' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300'
                  }`}
                >
                  {loading ? 'Analyzing...' : 'Analyze Code'}
                </button>
              </div>

              {/* Analysis Results Section */}
              <div className={`col-span-12 lg:col-span-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 lg:p-6 min-h-[300px] lg:min-h-[400px]`}>
                <h2 className={`text-lg sm:text-xl font-bold mb-4 lg:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Debugging Result
                </h2>
                {analysis ? (
                  <div className="space-y-4 lg:space-y-6">
                    {analysis.issues && analysis.issues.length > 0 && (
                      <div>
                        <h3 className={`text-base sm:text-lg font-semibold mb-3 lg:mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Detected Errors
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                          {analysis.issues.map((issue, index) => (
                            <li key={index} className={`p-3 sm:p-4 rounded-lg ${
                              darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'
                            }`}>
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                      <div>
                        <h3 className={`text-base sm:text-lg font-semibold mb-3 lg:mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          Suggested Fix
                        </h3>
                        <div className={`p-3 sm:p-4 rounded-lg ${
                          darkMode ? 'bg-gray-700/30 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          <pre className="whitespace-pre-wrap text-sm sm:text-base">
                            {analysis.suggestions.join('\n')}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-[250px] sm:h-[300px] lg:h-[350px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {loading ? 'Analyzing...' : 'No analysis results yet'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Debugger; 