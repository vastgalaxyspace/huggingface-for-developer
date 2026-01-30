import { Shield } from 'lucide-react';
import { calculateDeploymentScore } from '../../utils/scoringEngine';

const ScoreBadge = ({ modelData, size = 'small' }) => {
  const { total, rating } = calculateDeploymentScore(modelData);
  
  const sizes = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    green: 'bg-green-500/20 border-green-500/50 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    orange: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    red: 'bg-red-500/20 border-red-500/50 text-red-400'
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-lg border ${sizes[size]} ${colorClasses[rating.color]}`}
      title={`Deployment Readiness: ${rating.label}`}
    >
      <Shield className="w-4 h-4" />
      <span className="font-bold">{total}/100</span>
      <span className="hidden sm:inline">{rating.emoji}</span>
    </div>
  );
};

export default ScoreBadge;