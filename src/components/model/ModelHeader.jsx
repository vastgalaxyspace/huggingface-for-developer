import { useState } from 'react';
import { Star, Download, Calendar, ExternalLink, Copy, Check, Tag } from 'lucide-react';
import { Shield } from 'lucide-react';
import { calculateDeploymentScore } from '../../utils/scoringEngine';

const ModelHeader = ({ modelData }) => {
  const { modelId, author, lastModified, downloads, likes } = modelData;
  const [copied, setCopied] = useState(false);

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

  const handleCopyModelId = () => {
    navigator.clipboard.writeText(modelId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract tags from metadata
  const tags = modelData.tags || modelData.metadata?.tags || [];
  const pipelineTag = modelData.pipeline_tag || modelData.metadata?.pipeline_tag;
  const library = modelData.library_name || modelData.metadata?.library_name;

  // Categorize tags for display
  const tagCategories = {
    task: [],
    library: [],
    language: [],
    format: [],
    other: []
  };

  // Common language codes
  const languageCodes = ['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'pt', 'ru', 'ar', 'hi', 'it', 'multilingual'];
  const formatTags = ['safetensors', 'gguf', 'gptq', 'awq', 'onnx', 'pytorch', 'tensorflow', 'jax', 'torch'];
  const libraryTags = ['transformers', 'diffusers', 'peft', 'trl', 'vllm', 'llama.cpp', 'sentence-transformers'];

  if (pipelineTag) tagCategories.task.push(pipelineTag);
  if (library) tagCategories.library.push(library);

  tags.forEach(tag => {
    const lower = tag.toLowerCase();
    if (languageCodes.includes(lower)) {
      tagCategories.language.push(tag);
    } else if (formatTags.includes(lower)) {
      tagCategories.format.push(tag);
    } else if (libraryTags.includes(lower)) {
      tagCategories.library.push(tag);
    } else if (lower.startsWith('arxiv:') || lower.startsWith('license:') || lower.startsWith('dataset:')) {
      tagCategories.other.push(tag);
    } else if (!tagCategories.task.includes(tag)) {
      tagCategories.other.push(tag);
    }
  });

  // Tag styling by category
  const tagStyles = {
    task: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    library: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    language: 'bg-green-500/15 text-green-300 border-green-500/25',
    format: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
    other: 'bg-gray-500/15 text-gray-300 border-gray-500/25'
  };

  const allTags = [
    ...tagCategories.task.map(t => ({ tag: t, style: tagStyles.task, icon: '🎯' })),
    ...tagCategories.library.map(t => ({ tag: t, style: tagStyles.library, icon: '📦' })),
    ...tagCategories.format.map(t => ({ tag: t, style: tagStyles.format, icon: '💾' })),
    ...tagCategories.language.map(t => ({ tag: t, style: tagStyles.language, icon: '🌐' })),
    ...tagCategories.other.slice(0, 5).map(t => ({ tag: t, style: tagStyles.other, icon: '🏷️' })),
  ];

  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Model Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl font-bold text-white">{modelId}</h2>
            
            {/* Copy Model ID Button */}
            <button
              onClick={handleCopyModelId}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
              title="Copy model ID"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
            
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

      {/* Tags Section */}
      {allTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(({ tag, style, icon }, idx) => (
              <span
                key={`${tag}-${idx}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border ${style}`}
              >
                <span className="text-[10px]">{icon}</span>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelHeader;