import { useState } from 'react';
import { Cpu, DollarSign, Zap, Server, Cloud, TrendingUp } from 'lucide-react';
import {
  getGPURecommendations,
  calculateCloudCosts,
  compareDeploymentCosts,
  calculateBatchSizeRecommendations,
  estimateThroughput
} from '../../utils/hardwareRecommendations';

const HardwareRecommendations = ({ modelData }) => {
  const [selectedTab, setSelectedTab] = useState('gpus');
  const [tokensPerMonth, setTokensPerMonth] = useState(1000000); // 1M tokens default
  
  const vramRequired = parseFloat(modelData.vramEstimates?.fp16 || 16);
  const contextLength = modelData.config?.max_position_embeddings || 4096;
  
  const gpuRecs = getGPURecommendations(vramRequired);
  const cloudCosts = calculateCloudCosts(vramRequired);
  const deploymentComparison = compareDeploymentCosts(tokensPerMonth, vramRequired);

  const tabs = [
    { id: 'gpus', label: 'GPU Options', icon: Cpu },
    { id: 'cloud', label: 'Cloud Pricing', icon: Cloud },
    { id: 'comparison', label: 'Cost Comparison', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Zap }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">
            Hardware & Deployment
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                selectedTab === tab.id
                  ? 'bg-purple-500/30 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-semibold text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* GPU Options Tab */}
        {selectedTab === 'gpus' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-white mb-1">
                    Required: ~{vramRequired}GB VRAM (FP16)
                  </div>
                  <div className="text-sm text-gray-300">
                    Recommendations include 30% overhead for activations and KV cache
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Option */}
            {gpuRecs.budget && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                    BEST VALUE
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {gpuRecs.budget.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">VRAM</div>
                    <div className="text-white font-semibold">{gpuRecs.budget.vram}GB</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Utilization</div>
                    <div className="text-white font-semibold">{gpuRecs.budget.utilization}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Price</div>
                    <div className="text-white font-semibold">${gpuRecs.budget.price}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Tier</div>
                    <div className="text-white font-semibold capitalize">{gpuRecs.budget.tier}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  {gpuRecs.budget.use_case}
                </div>
              </div>
            )}

            {/* All Options */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">All Compatible GPUs</h3>
              <div className="space-y-3">
                {gpuRecs.recommended.map((gpu) => (
                  <div
                    key={gpu.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{gpu.name}</div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          gpu.tier === 'consumer' ? 'bg-blue-500/20 text-blue-400' :
                          gpu.tier === 'prosumer' ? 'bg-purple-500/20 text-purple-400' :
                          gpu.tier === 'professional' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {gpu.tier.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm">${gpu.price}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
                      <div>{gpu.vram}GB VRAM</div>
                      <div>{gpu.utilization}% utilized</div>
                      <div>{gpu.fp16_tflops} TFLOPS (FP16)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cloud Pricing Tab */}
        {selectedTab === 'cloud' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(cloudCosts).map(([provider, instance]) => (
                <div
                  key={provider}
                  className="bg-white/5 border border-white/10 rounded-xl p-5"
                >
                  <div className="text-sm text-gray-400 uppercase mb-2">{provider}</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${instance.monthlyCost.toFixed(0)}/mo
                  </div>
                  <div className="text-sm text-gray-300 mb-3">
                    ${instance.price.toFixed(2)}/hour
                  </div>
                  <div className="text-xs text-gray-400 border-t border-white/10 pt-3">
                    <div className="font-semibold text-white mb-1">{instance.gpu}</div>
                    <div>{instance.name}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="text-sm text-gray-300">
                💡 <strong>Tip:</strong> These are base compute costs. Add storage, networking, and data transfer fees.
                Consider spot instances for 60-70% savings on non-critical workloads.
              </div>
            </div>
          </div>
        )}

        {/* Cost Comparison Tab */}
        {selectedTab === 'comparison' && (
          <div className="space-y-6">
            {/* Usage Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Expected Monthly Token Usage
              </label>
              <input
                type="range"
                min="100000"
                max="100000000"
                step="100000"
                value={tokensPerMonth}
                onChange={(e) => setTokensPerMonth(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-400">100K</span>
                <span className="text-purple-400 font-bold">
                  {(tokensPerMonth / 1000000).toFixed(1)}M tokens/month
                </span>
                <span className="text-gray-400">100M</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`border rounded-xl p-5 ${
              deploymentComparison.recommendation.type === 'api' ? 'bg-green-500/10 border-green-500/20' :
              deploymentComparison.recommendation.type === 'hybrid' ? 'bg-yellow-500/10 border-yellow-500/20' :
              'bg-blue-500/10 border-blue-500/20'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <div className="font-bold text-white text-lg">Recommendation</div>
              </div>
              <div className="text-white font-semibold mb-1 capitalize">
                {deploymentComparison.recommendation.type} Deployment
              </div>
              <div className="text-sm text-gray-300">
                {deploymentComparison.recommendation.reason}
              </div>
            </div>

            {/* API Costs */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">API Services</h3>
              <div className="space-y-3">
                {Object.values(deploymentComparison.apiCosts).map((api) => (
                  <div key={api.name} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{api.name}</div>
                      <div className="text-xl font-bold text-purple-400">
                        ${api.monthly.toFixed(2)}/mo
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      ${api.costPer1K.toFixed(4)} per 1K tokens
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {api.pros.map((pro, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          ✓ {pro}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Self-Hosted */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Self-Hosted Options</h3>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-white">Cloud GPU (24/7)</div>
                    <div className="text-xl font-bold text-blue-400">
                      ${deploymentComparison.selfHosted.cloud.monthly.toFixed(0)}/mo
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {deploymentComparison.selfHosted.cloud.setup}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deploymentComparison.selfHosted.cloud.pros.map((pro, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
✓ {pro}
</span>
))}
</div>
</div>
</div>
</div>
</div>
)}
    {/* Performance Tab */}
    {selectedTab === 'performance' && gpuRecs.budget && (
      <div className="space-y-6">
        {(() => {
          const batchRecs = calculateBatchSizeRecommendations(
            gpuRecs.budget.vram,
            vramRequired,
            contextLength
          );
          const throughput = estimateThroughput(gpuRecs.budget, batchRecs.recommended);
          
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                  <div className="text-sm text-gray-400 mb-2">Recommended Batch Size</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {batchRecs.recommended}
                  </div>
                  <div className="text-xs text-gray-400">
                    Max: {batchRecs.maximum} | Conservative: {batchRecs.conservative}
                  </div>
                  {batchRecs.note && (
                    <div className="mt-3 text-xs text-yellow-400">
                      ⚠️ {batchRecs.note}
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                  <div className="text-sm text-gray-400 mb-2">Estimated Throughput</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {throughput.tokensPerSecond}
                  </div>
                  <div className="text-xs text-gray-400">
                    tokens/second on {gpuRecs.budget.name}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Requests/second (512 tokens each)</span>
                  <span className="text-white font-semibold">{throughput.requestsPerSecond}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily tokens (24/7)</span>
                  <span className="text-white font-semibold">
                    {(throughput.dailyTokens / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">GPU Utilization</span>
                  <span className="text-white font-semibold">{gpuRecs.budget.utilization}%</span>
                </div>
              </div>

              <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 text-xs text-gray-400">
                <strong>Note:</strong> {throughput.note}. Actual performance depends on model architecture,
                quantization, prompt engineering, and inference framework (vLLM, TensorRT-LLM, etc.).
              </div>
            </>
          );
        })()}
      </div>
    )}
  </div>
</div>
);
};
export default HardwareRecommendations;