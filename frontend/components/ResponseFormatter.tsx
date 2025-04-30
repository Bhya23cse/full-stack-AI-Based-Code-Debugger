import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Code2, AlertCircle, CheckCircle2, Lightbulb, Copy, ExternalLink } from 'lucide-react';

interface ResponseSection {
  title: string;
  content: string | string[];
  type: 'text' | 'list' | 'code' | 'table';
  listType?: 'bullet' | 'number';
  language?: string;
  tableHeaders?: string[];
  tableData?: string[][];
  severity?: 'info' | 'warning' | 'error' | 'success';
  steps?: string[];
  isCollapsible?: boolean;
  explanation?: string;
  impact?: string;
  references?: string[];
  confidence?: number;
}

interface ResponseFormatterProps {
  title: string;
  introduction: string;
  sections: ResponseSection[];
}

const MainTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
    <Code2 className="w-5 h-5 text-indigo-500" />
    {children}
  </h5>
);

const Introduction = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-base text-slate-700 dark:text-slate-300 mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500"
  >
    <div className="flex items-start gap-2">
      <Lightbulb className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
      <div>{text}</div>
    </div>
  </motion.div>
);

const SectionTitle = ({ children, isOpen, onToggle }: { children: React.ReactNode; isOpen?: boolean; onToggle?: () => void }) => (
  <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
    <h6 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-indigo-500 rounded" />
      {children}
    </h6>
    {isOpen !== undefined && (
      <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
    )}
  </div>
);

const ContentList = ({ items, type }: { items: string[]; type: 'bullet' | 'number' }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="mb-4 pl-4"
  >
    {type === 'bullet' ? (
      <ul className="list-disc space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-2" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ) : (
      <ol className="list-decimal space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <span className="font-medium text-indigo-900 dark:text-indigo-100">{i + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    )}
  </motion.div>
);

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 group relative"
    >
      <div className="bg-slate-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
          {language && (
            <div className="text-slate-400 text-sm">
              {language}
            </div>
          )}
          <button
            onClick={copyToClipboard}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy code"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-slate-100 text-sm font-mono">
            {code}
          </code>
        </pre>
      </div>
    </motion.div>
  );
};

const Table = ({ headers, data }: { headers: string[]; data: string[][] }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mb-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"
  >
    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead className="bg-slate-50 dark:bg-slate-800">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {row.map((cell, j) => (
              <td
                key={j}
                className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);

const DebugStep = ({ number, content }: { number: number; content: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start space-x-3 mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
  >
    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
      <span className="text-indigo-600 dark:text-indigo-300 font-medium">{number}</span>
    </div>
    <div className="flex-1">
      <p className="text-slate-700 dark:text-slate-300">{content}</p>
    </div>
  </motion.div>
);

const SeverityBadge = ({ type }: { type: 'info' | 'warning' | 'error' | 'success' }) => {
  const colors = {
    info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    error: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
  };

  const icons = {
    info: '📝',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[type]}`}>
      <span className="mr-1">{icons[type]}</span>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const Explanation = ({ text, impact, references, confidence }: { 
  text: string; 
  impact?: string;
  references?: string[];
  confidence?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-indigo-500"
  >
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-indigo-500" />
        <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Why this matters</h6>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
      
      {impact && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Impact</h6>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{impact}</p>
        </div>
      )}

      {confidence !== undefined && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-emerald-500">🎯</div>
            <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Confidence Level</h6>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">{confidence}%</span>
          </div>
        </div>
      )}

      {references && references.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-500" />
            <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-200">References</h6>
          </div>
          <ul className="mt-1 space-y-1">
            {references.map((ref, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                <a 
                  href={ref} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </motion.div>
);

export default function ResponseFormatter({ 
  title, 
  introduction, 
  sections,
  type = 'analysis'
}: ResponseFormatterProps & { type?: 'analysis' | 'debug' }) {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <MainTitle>{title}</MainTitle>
        <SeverityBadge type={type === 'analysis' ? 'info' : 'warning'} />
      </div>
      <Introduction text={introduction} />
      
      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.section
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 md:p-6 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <SectionTitle 
                isOpen={openSections[index]} 
                onToggle={() => toggleSection(index)}
              >
                {section.title}
              </SectionTitle>
              {section.severity && <SeverityBadge type={section.severity} />}
            </div>
            
            <AnimatePresence>
              {openSections[index] !== false && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {section.type === 'text' && (
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {section.content as string}
                    </div>
                  )}
                  
                  {section.type === 'list' && (
                    <ContentList 
                      items={section.content as string[]} 
                      type={section.listType || 'bullet'} 
                    />
                  )}
                  
                  {section.type === 'code' && (
                    <CodeBlock 
                      code={section.content as string} 
                      language={section.language} 
                    />
                  )}
                  
                  {section.type === 'table' && section.tableHeaders && section.tableData && (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                      <Table 
                        headers={section.tableHeaders} 
                        data={section.tableData} 
                      />
                    </div>
                  )}

                  {section.steps && (
                    <div className="space-y-3">
                      {section.steps.map((step, i) => (
                        <DebugStep key={i} number={i + 1} content={step} />
                      ))}
                    </div>
                  )}

                  {(section.explanation || section.impact || section.references || section.confidence !== undefined) && (
                    <Explanation
                      text={section.explanation || ''}
                      impact={section.impact}
                      references={section.references}
                      confidence={section.confidence}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        ))}
      </div>
    </div>
  );
} 