import { Star, Download, Calendar, ExternalLink } from 'lucide-react';
import { Shield } from 'lucide-react';
import { calculateDeploymentScore } from '../../utils/scoringEngine';

const ModelHeader = ({ modelData }) => {
  const { modelId, author, lastModified, downloads, likes } = modelData;

  const scoreData = calculateDeploymentScore(modelData);
  const { total, rating } = scoreData;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Model Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white">{modelId}</h2>
            
            <a
              href={`https://huggingface.co/${modelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
              rating.color === 'green' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
              rating.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
              rating.color === 'orange' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
              'bg-red-500/20 border-red-500/50 text-red-400'
            }`}>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-bold">{total}/100</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              by <span className="font-semibold text-purple-400">{author}</span>
            </span>
            {lastModified && (
              <>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Updated {formatDate(lastModified)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          {/* Likes */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold text-xl">{formatNumber(likes)}</span>
            </div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>

          {/* Downloads */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
              <Download className="w-5 h-5" />
              <span className="font-bold text-xl">{formatNumber(downloads)}</span>
            </div>
            <div className="text-xs text-gray-400">Downloads</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {modelData.card?.description && (
        <p className="mt-4 text-gray-300 leading-relaxed">
          {modelData.card.description}
        </p>
      )}
    </div>
  );
};

export default ModelHeader;