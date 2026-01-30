const ScoreGauge = ({ score, size = 'large' }) => {
  const sizes = {
    small: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    medium: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    large: { container: 'w-40 h-40', text: 'text-5xl', label: 'text-base' }
  };

  const getColor = (score) => {
    if (score >= 80) return { stroke: '#10b981', glow: 'shadow-green-500/50' };
    if (score >= 70) return { stroke: '#eab308', glow: 'shadow-yellow-500/50' };
    if (score >= 60) return { stroke: '#f97316', glow: 'shadow-orange-500/50' };
    return { stroke: '#ef4444', glow: 'shadow-red-500/50' };
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className={`${sizes[size].container} transform -rotate-90`}>
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={color.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px currentColor)'
          }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${sizes[size].text} font-bold text-white`}>
          {score}
        </div>
        <div className={`${sizes[size].label} text-gray-400`}>
          / 100
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;