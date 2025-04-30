import { AnalysisResult } from '../types/analysis';
import ResponseFormatter from './ResponseFormatter';

export default function AnalysisResults({ result }: { result: AnalysisResult }) {
  const formatMetricsToTable = () => {
    return {
      headers: ['Metric', 'Score'],
      data: Object.entries(result.metrics).map(([key, value]) => [
        key,
        `${value}%`
      ])
    };
  };

  const sections = [
    {
      title: 'Analysis Overview',
      content: result.analysis,
      type: 'text' as const
    },
    {
      title: 'Quality Metrics',
      type: 'table' as const,
      content: '',
      tableHeaders: formatMetricsToTable().headers,
      tableData: formatMetricsToTable().data
    },
    ...(result.issues && result.issues.length > 0 ? [{
      title: 'Identified Issues',
      type: 'list' as const,
      content: result.issues.map(issue => 
        `${issue.type}: ${issue.description}${issue.solution ? `\nSolution: ${issue.solution}` : ''}`
      ),
      listType: 'bullet' as const
    }] : []),
    ...(result.solutions && result.solutions.length > 0 ? [{
      title: 'Recommended Solutions',
      type: 'list' as const,
      content: result.solutions.map(solution => 
        `${solution.type}: ${solution.description}`
      ),
      listType: 'number' as const
    }] : [])
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-h-[90vh] overflow-y-auto">
        <ResponseFormatter
          title="Code Analysis Results"
          introduction="Detailed analysis of your code's quality, performance, and potential improvements."
          sections={sections}
        />
      </div>
    </div>
  );
} 