import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Info, Award } from 'lucide-react';

const BenchmarkVisualizer = ({ modelData }) => {
  const benchmarks = modelData.card?.benchmarks || {};
  
  // If no benchmarks, show message
  if (Object.keys(benchmarks).length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          No Benchmark Data Available
        </h3>
        <p className="text-gray-400">
          This model doesn't have published benchmark scores in the model card.
        </p>
      </div>
    );
  }

  // Benchmark explanations
  const benchmarkInfo = {
    mmlu: {
      name: 'MMLU (Massive Multitask Language Understanding)',
      description: 'Tests knowledge across 57 subjects including math, history, law, and science',
      useCase: 'General knowledge and reasoning',
      goodScore: 60,
      excellentScore: 70,
      interpretation: (score) => {
        if (score >= 70) return 'Excellent general knowledge';
        if (score >= 60) return 'Good general knowledge';
        if (score >= 50) return 'Moderate general knowledge';
        return 'Limited general knowledge';
      }
    },
    gsm8k: {
      name: 'GSM8K (Grade School Math)',
      description: 'Tests mathematical reasoning with grade school level word problems',
      useCase: 'Mathematical problem solving',
      goodScore: 40,
      excellentScore: 60,
      interpretation: (score) => {
        if (score >= 60) return 'Strong math reasoning';
        if (score >= 40) return 'Decent math ability';
        if (score >= 20) return 'Basic math capability';
        return 'Weak at math';
      }
    },
    humaneval: {
      name: 'HumanEval (Code Generation)',
      description: 'Tests ability to generate correct Python code from docstrings',
      useCase: 'Code generation and completion',
      goodScore: 40,
      excellentScore: 60,
      interpretation: (score) => {
        if (score >= 60) return 'Excellent code generation';
        if (score >= 40) return 'Good code generation';
        if (score >= 20) return 'Basic code capability';
        return 'Limited coding ability';
      }
    },
    hellaswag: {
      name: 'HellaSwag (Common Sense)',
      description: 'Tests common sense reasoning through sentence completion',
      useCase: 'Common sense and context understanding',
      goodScore: 75,
      excellentScore: 85,
      interpretation: (score) => {
        if (score >= 85) return 'Excellent common sense';
        if (score >= 75) return 'Good common sense';
        if (score >= 60) return 'Moderate common sense';
        return 'Limited common sense';
      }
    },
    arc: {
      name: 'ARC (AI2 Reasoning Challenge)',
      description: 'Tests scientific reasoning with grade-school science questions',
      useCase: 'Scientific reasoning and problem solving',
      goodScore: 60,
      excellentScore: 75,
      interpretation: (score) => {
        if (score >= 75) return 'Strong scientific reasoning';
        if (score >= 60) return 'Good reasoning ability';
        if (score >= 50) return 'Moderate reasoning';
        return 'Basic reasoning capability';
      }
    },
    truthfulqa: {
      name: 'TruthfulQA',
      description: 'Tests ability to provide truthful answers and avoid common misconceptions',
      useCase: 'Truthfulness and factual accuracy',
      goodScore: 40,
      excellentScore: 50,
      interpretation: (score) => {
        if (score >= 50) return 'Very truthful';
        if (score >= 40) return 'Reasonably truthful';
        if (score >= 30) return 'Moderately truthful';
        return 'May produce misconceptions';
      }
    }
  };

  // Prepare data for chart
  const chartData = Object.entries(benchmarks).map(([key, value]) => ({
    name: key.toUpperCase(),
    score: parseFloat(value),
    fullName: benchmarkInfo[key.toLowerCase()]?.name || key,
    color: getScoreColor(parseFloat(value), benchmarkInfo[key.toLowerCase()])
  }));

  const getScoreColor = (score, info) => {
    if (!info) return '#8b5cf6';
    if (score >= info.excellentScore) return '#10b981';
    if (score >= info.goodScore) return '#eab308';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const key = data.payload.name.toLowerCase();
      const info = benchmarkInfo[key];

      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-xl max-w-xs">
          <p className="font-bold text-white mb-2">{data.payload.fullName}</p>
          <p className="text-2xl font-bold text-purple-400 mb-2">{data.value}%</p>
          {info && (
            <>
              <p className="text-sm text-gray-300 mb-2">{info.interpretation(data.value)}</p>
              <p className="text-xs text-gray-400">{info.description}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">
            Benchmark Performance
          </h2>
        </div>
        <p className="text-gray-400">
          Model performance across standard evaluation benchmarks
        </p>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9ca3af"
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark Cards */}
      <div className="border-t border-white/10 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(benchmarks).map(([key, value]) => {
          const info = benchmarkInfo[key.toLowerCase()];
          if (!info) return null;

          const score = parseFloat(value);
          const color = getScoreColor(score, info);

          return (
            <div
              key={key}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm mb-1">
                    {info.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {info.useCase}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color }}>
                    {score}%
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color }} />
                <span className="text-xs font-semibold" style={{ color }}>
                  {info.interpretation(score)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-white/10 p-6 bg-black/20">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <strong className="text-white">How to interpret:</strong> Higher scores indicate better performance. 
            Benchmarks test different capabilities - choose models based on scores in your target use case. 
            For example, high GSM8K for math applications, high HumanEval for code generation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkVisualizer;