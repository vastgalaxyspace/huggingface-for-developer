import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry }) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'not_found':
        return '🔍';
      case 'network':
        return '📡';
      case 'validation':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">{getErrorIcon()}</div>
        
        <h2 className="text-2xl font-bold text-red-400 mb-2">
          {error.title}
        </h2>
        
        <p className="text-gray-300 mb-4">
          {error.message}
        </p>
        
        {error.suggestion && (
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300 text-left">
                {error.suggestion}
              </p>
            </div>
          </div>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;