export interface CodeIssue {
  lineNumber: number;
  message: string;
  severity: string;
  column?: number;
}

export interface AnalysisResult {
  success: boolean;
  analysis: string;
  model: string;
  error?: string;
  warning?: string;
  issues?: CodeIssue[];
}

interface AnalysisResultsProps {
  results: AnalysisResult | null;
  loading: boolean;
}

const AnalysisResults = ({ results, loading }: AnalysisResultsProps) => {
  if (loading) {
    return (
      <div className="w-full max-w-3xl mt-8 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing your code...</p>
      </div>
    );
  }

  if (!results) return null;

  if (!results.success) {
    return (
      <div className="w-full max-w-3xl mt-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400">Analysis Error</h2>
          <p className="text-red-600 dark:text-red-300">{results.error || 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Check if we have specific issues from pattern analysis
  const hasIssues = results.issues && results.issues.length > 0;

  // Split the analysis into sections
  const sections = results.analysis.split('\n\n').filter(Boolean);

  return (
    <div className="w-full max-w-3xl mt-8 space-y-6">
      {/* Model Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
        <span>Analyzed using: {results.model}</span>
      </div>

      {/* Warning Banner for Rate Limits */}
      {results.warning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Warning</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">{results.warning}</p>
        </div>
      )}

      {/* Issues from Pattern Analysis */}
      {hasIssues && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Detected Issues
          </h2>
          <div className="space-y-4">
            {results.issues!.map((issue, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${
                  issue.severity === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                  issue.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {issue.severity === 'error' ? (
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : issue.severity === 'warning' ? (
                      <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      issue.severity === 'error' ? 'text-red-800 dark:text-red-300' :
                      issue.severity === 'warning' ? 'text-yellow-800 dark:text-yellow-300' :
                      'text-blue-800 dark:text-blue-300'
                    }`}>
                      Line {issue.lineNumber}
                    </h3>
                    <div className={`mt-1 text-sm ${
                      issue.severity === 'error' ? 'text-red-700 dark:text-red-300' :
                      issue.severity === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-blue-700 dark:text-blue-300'
                    }`}>
                      {issue.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Sections */}
      {sections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          {section.split('\n').map((line, lineIndex) => {
            // Check if it's a header (starts with # for markdown)
            if (line.startsWith('# ')) {
              return (
                <h1 key={lineIndex} className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  {line.replace(/^#\s*/, '').trim()}
                </h1>
              );
            }
            
            // Check if it's a header (starts with ## for markdown)
            if (line.startsWith('## ')) {
              return (
                <h2 key={lineIndex} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">
                  {line.replace(/^##\s*/, '').trim()}
                </h2>
              );
            }
            
            // Check if it's a subheader (starts with ### for markdown)
            if (line.startsWith('### ')) {
              return (
                <h3 key={lineIndex} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
                  {line.replace(/^###\s*/, '').trim()}
                </h3>
              );
            }
            
            // Check if it's a bullet point
            if (line.startsWith('- ')) {
              return (
                <div key={lineIndex} className="flex items-start mt-2">
                  <span className="mr-2">•</span>
                  <p className="text-gray-700 dark:text-gray-300">{line.replace(/^-\s*/, '').trim()}</p>
                </div>
              );
            }
            
            // Check if it's an issue with a line number
            if (line.toLowerCase().includes('line') && 
               (line.toLowerCase().includes('error') || 
                line.toLowerCase().includes('warning') || 
                line.toLowerCase().includes('issue'))) {
              return (
                <div
                  key={lineIndex}
                  className="p-4 my-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500"
                >
                  <p className="text-gray-700 dark:text-gray-300">{line}</p>
                </div>
              );
            }

            // Regular text
            return (
              <p key={lineIndex} className="text-gray-700 dark:text-gray-300 my-2">
                {line}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default AnalysisResults; 