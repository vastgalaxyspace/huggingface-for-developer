import { Loader2, Download, FileText, Settings } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading model data...' }) => {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-12">
        {/* Animated spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-xl text-gray-300 mb-8">
          {message}
        </p>

        {/* Loading steps */}
        <div className="space-y-3">
          <LoadingStep icon={Download} text="Fetching model metadata..." delay={0} />
          <LoadingStep icon={Settings} text="Downloading config.json..." delay={500} />
          <LoadingStep icon={FileText} text="Reading model card..." delay={1000} />
        </div>
      </div>
    </div>
  );
};

const LoadingStep = ({ icon: Icon, text, delay }) => {
  return (
    <div 
      className="flex items-center gap-3 text-gray-400 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default LoadingSpinner;