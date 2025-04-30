import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ResponseFormatter from './ResponseFormatter';
import { Line, Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface CodeProcessorProps {
  code: string;
  language: string;
}

const PARROT_COLORS = {
  red: '#FF5A5A',
  green: '#50C878',
  blue: '#5B9BD5',
  yellow: '#FFD700',
  purple: '#8A2BE2',
};

const DataVisualization = ({ data }: { data: any }) => {
  const metricsData = {
    labels: Object.keys(data.metrics || {}),
    datasets: [
      {
        label: 'Scores',
        data: Object.values(data.metrics || {}).map((m: any) => m.score),
        backgroundColor: [
          PARROT_COLORS.red,
          PARROT_COLORS.green,
          PARROT_COLORS.blue,
          PARROT_COLORS.yellow,
        ].map(color => color + '80'), // Add transparency
        borderColor: [
          PARROT_COLORS.red,
          PARROT_COLORS.green,
          PARROT_COLORS.blue,
          PARROT_COLORS.yellow,
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Code Quality Metrics',
        color: '#718096',
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <Radar data={metricsData} options={options} />
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <Bar data={metricsData} options={options} />
      </div>
    </div>
  );
};

export default function CodeProcessor({ code, language }: CodeProcessorProps) {
  const [mode, setMode] = useState<'analysis' | 'debug'>('analysis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  const processCode = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          mode,
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error processing code:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatResponse = (data: any) => {
    if (mode === 'analysis') {
      // If the response already has sections, use them directly
      if (data.sections) {
        return {
          title: 'Code Analysis Results',
          introduction: data.analysis || 'Detailed analysis of code quality and potential improvements.',
          sections: data.sections.map((section: any) => ({
            ...section,
            content: Array.isArray(section.content) ? section.content : [section.content],
            listType: section.type === 'list' ? (section.listType || 'bullet') : undefined
          }))
        };
      }

      // Fallback to the old format if sections are not present
      return {
        title: 'Code Analysis Results',
        introduction: 'Detailed analysis of code quality and potential improvements.',
        sections: [
          {
            title: 'Code Quality Metrics',
            type: 'table',
            tableHeaders: ['Metric', 'Score', 'Status'],
            tableData: Object.entries(data.metrics || {}).map(([key, value]: [string, any]) => [
              key,
              `${value.score}%`,
              value.status
            ]),
            severity: 'info',
            explanation: 'These metrics provide a quantitative assessment of your code quality.',
            impact: 'Higher scores indicate better code quality and maintainability.',
            confidence: 85
          },
          {
            title: 'Identified Issues',
            type: 'list',
            content: data.issues?.map((issue: any) => issue.description) || [],
            listType: 'bullet',
            severity: 'warning',
            explanation: 'These issues could affect code quality, performance, or security.',
            impact: 'Addressing these issues will improve code reliability and maintainability.',
            confidence: 90
          },
          {
            title: 'Recommendations',
            type: 'list',
            content: data.recommendations || [],
            listType: 'number',
            severity: 'success',
            explanation: 'These recommendations will help improve your code quality and maintainability.',
            impact: 'Implementing these recommendations will lead to better code quality and performance.',
            confidence: 95
          }
        ]
      };
    }

    // Debug mode response
    return {
      title: 'Debug Results',
      introduction: 'Step-by-step analysis of code execution and issues.',
      sections: [
        {
          title: 'Error Detection',
          type: 'text',
          content: data.error?.message || 'No errors detected',
          severity: data.error ? 'error' : 'success',
          explanation: data.error ? 'This error needs to be addressed to make the code work properly.' : 'No errors were found in your code.',
          impact: data.error ? 'The code cannot execute properly until this error is fixed.' : 'Your code is ready to run.',
          confidence: 95
        },
        {
          title: 'Debug Steps',
          type: 'list',
          content: data.debugSteps || [],
          listType: 'number',
          steps: data.debugSteps || [],
          explanation: 'These steps will help you understand and fix the issues in your code.',
          impact: 'Following these steps will help you resolve the debugging issues.',
          confidence: 90
        },
        {
          title: 'Variable State',
          type: 'table',
          tableHeaders: ['Variable', 'Type', 'Value'],
          tableData: Object.entries(data.variables || {}).map(([key, value]: [string, any]) => [
            key,
            value.type,
            JSON.stringify(value.value)
          ]),
          explanation: 'This shows the current state of variables in your code.',
          impact: 'Understanding variable states helps in debugging and fixing issues.',
          confidence: 85
        },
        {
          title: 'Solution',
          type: 'text',
          content: data.solution || 'No fixes required',
          severity: 'success',
          explanation: 'This solution will help resolve the debugging issues.',
          impact: 'Implementing this solution will fix the identified issues.',
          confidence: 95
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setMode('analysis')}
            className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
              mode === 'analysis'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:text-white'
            }`}
          >
            🔍 Analyze Code
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setMode('debug')}
            className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
              mode === 'debug'
                ? 'bg-gradient-to-r from-yellow-500 to-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-red-400 hover:text-white'
            }`}
          >
            🐛 Debug Code
          </motion.button>
          {mode === 'analysis' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowVisualization(!showVisualization)}
              className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
                showVisualization
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-400 hover:text-white'
              }`}
            >
              📊 {showVisualization ? 'Hide' : 'Show'} Visualization
            </motion.button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={processCode}
          disabled={isProcessing}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
        >
          {isProcessing ? '⚡ Processing...' : '🚀 Process Code'}
        </motion.button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {mode === 'analysis' && showVisualization && (
            <DataVisualization data={result} />
          )}
          <ResponseFormatter
            {...formatResponse(result)}
            type={mode}
          />
        </motion.div>
      )}
    </div>
  );
} 