import { useState } from 'react';
import { Shield, Cpu, Layers, Zap, CheckCircle } from 'lucide-react';
import { analyzeCompatibility, getCompatibilitySummary } from '../../utils/compatibilityEngine';
import FrameworkMatrix from './FrameworkMatrix';
import GPUCompatibility from './GPUCompatibility';
import QuantizationSupport from './QuantizationSupport';
import FeatureSupport from './FeatureSupport';

const CompatibilityChecker = ({ modelData }) => {
  const [activeTab, setActiveTab] = useState('frameworks');
  
  // Safeguard: Ensure compatibility object exists even if analysis fails
  const compatibility = analyzeCompatibility(modelData) || {};
  const summary = getCompatibilitySummary(compatibility);

  const tabs = [
    { 
      id: 'frameworks', 
      label: 'Frameworks', 
      icon: Layers, 
      component: FrameworkMatrix, 
      // FIX: Wrap data in 'frameworks' key so it's passed as a prop
      data: { frameworks: compatibility.frameworks || {} } 
    },
    { 
      id: 'hardware', 
      label: 'Hardware', 
      icon: Cpu, 
      component: GPUCompatibility, 
      // FIX: Wrap data for other components too (assuming they follow the same pattern)
      data: { hardware: compatibility.hardware || {} } 
    },
    { 
      id: 'quantization', 
      label: 'Quantization', 
      icon: Shield, 
      component: QuantizationSupport, 
      data: { quantization: compatibility.quantization || {} } 
    },
    { 
      id: 'features', 
      label: 'Features', 
      icon: Zap, 
      component: FeatureSupport, 
      data: { features: compatibility.features || {} } 
    }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;
  const activeData = tabs.find(t => t.id === activeTab)?.data;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">
                Compatibility Analysis
              </h2>
            </div>
            <p className="text-gray-400">
              Framework support, hardware requirements, and deployment options
            </p>
          </div>

          {/* Overall Score */}
          <div className="text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-white mb-1">
              {summary.overallCompatibility}
            </div>
            <div className="text-xs text-gray-400">Overall</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(summary.frameworkScore)}%
            </div>
            <div className="text-xs text-gray-400">Framework Support</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(summary.quantizationScore)}%
            </div>
            <div className="text-xs text-gray-400">Quantization</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(summary.featureScore)}%
            </div>
            <div className="text-xs text-gray-400">Advanced Features</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-6">
        <div className="flex gap-2 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Now spreading activeData passes the correct props, e.g., frameworks={...} */}
        {ActiveComponent && <ActiveComponent {...activeData} />}
      </div>
    </div>
  );
};

export default CompatibilityChecker;