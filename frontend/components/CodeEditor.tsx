import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
  readOnly?: boolean;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: () => void;
}

const MAX_CODE_LENGTH = 10000; // Maximum code length in characters
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 14;

const CodeEditor = ({
  value,
  onChange,
  language,
  theme = 'vs-dark',
  readOnly = false,
  onAnalysisStart,
  onAnalysisComplete,
}: CodeEditorProps) => {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor settings
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: fontSize,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      wordBasedSuggestions: true,
      formatOnPaste: true,
      formatOnType: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'full',
      tabSize: 2,
    });

    // Add custom error markers
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Basic syntax suggestions
        const suggestions = [
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if (${1:condition}) {\n\t${2}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
        ];

        return { suggestions };
      },
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value && value.length <= MAX_CODE_LENGTH) {
      onChange(value);
    } else if (value && value.length > MAX_CODE_LENGTH) {
      // Truncate the value if it exceeds the limit
      onChange(value.slice(0, MAX_CODE_LENGTH));
      // Show warning
      if (editorRef.current) {
        editorRef.current.getAction('editor.action.showHover').run();
      }
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.min(Math.max(fontSize + delta, MIN_FONT_SIZE), MAX_FONT_SIZE);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  return (
    <div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFontSizeChange(-1)}
          disabled={fontSize <= MIN_FONT_SIZE}
          className="h-6 w-6"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm w-8 text-center">{fontSize}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFontSizeChange(1)}
          disabled={fontSize >= MAX_FONT_SIZE}
          className="h-6 w-6"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          fontSize: fontSize,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          wordBasedSuggestions: true,
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'full',
          tabSize: 2,
        }}
      />
      {value.length > MAX_CODE_LENGTH * 0.8 && (
        <div className="absolute bottom-2 right-2 text-sm text-yellow-500 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
          {Math.round((value.length / MAX_CODE_LENGTH) * 100)}% of maximum length
        </div>
      )}
    </div>
  );
};

export default CodeEditor; 