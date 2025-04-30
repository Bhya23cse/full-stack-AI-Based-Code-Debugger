'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Lightbulb, Code2, Wand2, Bug, ListOrdered, List } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import { analyzeCode } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
];

const formatContent = (content: string) => {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    // Check if paragraph is a code block
    if (paragraph.startsWith('```')) {
      const codeContent = paragraph.replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```/g, '');
        return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>${code}</code></pre>`;
      });
      return <div key={index} dangerouslySetInnerHTML={{ __html: codeContent }} />;
    }
    
    // Check if paragraph is a list
    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').map(item => item.replace(/^[-*]\s/, ''));
      return (
        <ul key={index} className="list-disc pl-6 my-4 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-muted-foreground">{item}</li>
          ))}
        </ul>
      );
    }
    
    // Check if paragraph is a numbered list
    if (paragraph.match(/^\d+\.\s/)) {
      const items = paragraph.split('\n').map(item => item.replace(/^\d+\.\s/, ''));
      return (
        <ol key={index} className="list-decimal pl-6 my-4 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-muted-foreground">{item}</li>
          ))}
        </ol>
      );
    }
    
    // Regular paragraph
    return <p key={index} className="text-muted-foreground my-4">{paragraph}</p>;
  });
};

export default function AnalyzerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [isRealTimeAnalysis, setIsRealTimeAnalysis] = useState(false);
  const { theme, setTheme } = useTheme();
  const debouncedCode = useDebounce(code, 1000);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCode(code, language);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real-time analysis
  useEffect(() => {
    if (isRealTimeAnalysis && debouncedCode) {
      handleAnalyze();
    }
  }, [debouncedCode, language, isRealTimeAnalysis]);

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

  return (
      <div className="space-y-6">
        {analysisResult.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Error</h3>
                <p>{analysisResult.error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {analysisResult.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg"
          >
            <div className="flex items-start">
              <Wand2 className="mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Analysis</h3>
                <div className="prose dark:prose-invert max-w-none">
                  {formatContent(analysisResult.analysis)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {analysisResult.issues?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="font-semibold flex items-center">
              <Bug className="mr-2 h-5 w-5" />
              Detected Issues
            </h3>
            <div className="space-y-2">
              {analysisResult.issues.map((issue: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${
                    issue.severity === 'error'
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}
                >
                  <div className="flex items-start">
                    <AlertCircle className="mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{issue.message}</p>
                      <p className="text-sm opacity-75">Line: {issue.lineNumber}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {analysisResult.solutions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg"
          >
            <div className="flex items-start">
              <CheckCircle2 className="mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Solutions</h3>
                <div className="prose dark:prose-invert max-w-none">
                  {formatContent(analysisResult.solutions)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {analysisResult.suggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg"
          >
            <div className="flex items-start">
              <Lightbulb className="mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Suggestions</h3>
                <div className="prose dark:prose-invert max-w-none">
                  {formatContent(analysisResult.suggestions)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {analysisResult.correctedCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <h3 className="font-semibold mb-2 flex items-center">
              <Code2 className="mr-2 h-5 w-5" />
              Corrected Code
            </h3>
            <CodeEditor
              value={analysisResult.correctedCode}
              onChange={() => {}}
              language={language}
              readOnly
            />
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">AI Code Debugger</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Code Editor */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Code Editor</h2>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                onAnalysisStart={() => setIsAnalyzing(true)}
                onAnalysisComplete={() => setIsAnalyzing(false)}
              />
              <div className="mt-4 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCode('')}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !code.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Run Debugger
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Debugger Results */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Debugger Results</h2>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isRealTimeAnalysis}
                      onChange={(e) => setIsRealTimeAnalysis(e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm">Real-time Analysis</span>
                  </label>
                </div>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Analyzing code...</span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {renderAnalysisResult()}
                </AnimatePresence>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 