import { ArrowLeft, Layers, Code, Copy, Check, Terminal, AlertTriangle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import ModelHeader from '../components/model/ModelHeader';
import QuickDecisionPanel from '../components/model/QuickDecisionPanel';
import ParameterCard from '../components/model/ParameterCard';
import HardwareRecommendations from '../components/model/HardwareRecommendations';
import FavoriteButton from '../components/common/FavoriteButton';
import CompareButton from '../components/common/CompareButton';
import { getParameterExplanation } from '../utils/parameterExplanations';
import DeploymentScore from '../components/scoring/DeploymentScore';
import ModelRadarChart from '../components/charts/ModelRadarChart';
import CompatibilityChecker from '../components/compatibility/CompatibilityChecker';
import AlternativesSuggester from '../components/alternatives/AlternativesSuggester';
import TCOCalculator from '../components/tco/TCOCalculator';
import BenchmarkVisualizer from '../components/benchmarks/BenchmarkVisualizer';
import LiveModelTester from '../components/tester/LiveModelTester';
import DecisionMatrix from '../components/matrix/DecisionMatrix';

const ModelDetailPage = ({
  modelData,
  onBack,
  onAddToComparison,
  onRemoveFromComparison,
  isInComparison,
  canAddMore,
  onToggleFavorite,
  isFavorite,
  allModels = [] // Added prop
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [similarModels, setSimilarModels] = useState([]);

  // Find similar models based on VRAM
  useEffect(() => {
    if (modelData && allModels.length > 0) {
      const currentVRAM = parseFloat(modelData.vramEstimates?.fp16 || 0);
      const similar = allModels
        .filter(m => m.modelId !== modelData.modelId)
        .filter(m => {
          const vram = parseFloat(m.vramEstimates?.fp16 || 0);
          return Math.abs(vram - currentVRAM) <= 8; // Within 8GB
        })
        .slice(0, 2); // Top 2 similar

      setSimilarModels([modelData, ...similar]);
    }
  }, [modelData, allModels]);

  // Helper function to copy code to clipboard
  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper function to parse notices from model card
  const parseModelNotices = () => {
    const notices = {
      deprecation: null,
      general: []
    };

    if (!modelData.card) return notices;

    const cardText = modelData.card.text || modelData.card.description || '';

    // Check for deprecation warnings
    const deprecationPatterns = [
      /⚠️.*?(?:deprecated|older version|previous generation|superseded)/i,
      /This (?:model|repository) (?:contains|has) (?:been )?(?:deprecated|superseded|replaced)/i,
    ];

    deprecationPatterns.forEach(pattern => {
      const match = cardText.match(pattern);
      if (match) {
        const startIndex = Math.max(0, match.index - 50);
        const endIndex = Math.min(cardText.length, match.index + match[0].length + 200);
        const context = cardText.substring(startIndex, endIndex).trim();

        // Extract replacement model link if present
        const replacementMatch = cardText.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);

        notices.deprecation = {
          message: context.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-200 underline">$1</a>'),
          replacement: replacementMatch ? {
            name: replacementMatch[1],
            url: replacementMatch[2]
          } : null
        };
      }
    });

    // Check for general notices
    const noticePatterns = [/⚠️.*?$/gm, /📢.*?$/gm];
    noticePatterns.forEach(pattern => {
      const matches = cardText.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && !notices.deprecation?.message?.includes(match[0])) {
          notices.general.push(match[0].trim());
        }
      }
    });

    return notices;
  };

  const notices = parseModelNotices();

  // Generate code snippets based on model
  const generateCodeSnippets = () => {
    const modelId = modelData.modelId || 'model-name';
    const snippets = [];

    // Basic Transformers usage
    snippets.push({
      title: 'Basic Usage with Transformers',
      language: 'Python',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
model = AutoModelForCausalLM.from_pretrained("${modelId}")

# Generate text
prompt = "Explain Machine Learning in a nutshell."
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_length=200)

# Decode output
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)`,
      description: 'Basic inference using Hugging Face Transformers library'
    });

    // Advanced generation
    snippets.push({
      title: 'Advanced Generation with Parameters',
      language: 'Python',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load model with optimizations
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
model = AutoModelForCausalLM.from_pretrained(
    "${modelId}",
    torch_dtype=torch.float16,
    device_map="auto"
)

# Generate with custom parameters
prompt = "Write a short story about AI:"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

outputs = model.generate(
    **inputs,
    max_new_tokens=500,
    temperature=0.7,
    top_p=0.9,
    top_k=50,
    repetition_penalty=1.1,
    do_sample=True
)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))`,
      description: 'Use custom generation parameters for better control over outputs'
    });

    // Mistral-specific if applicable
    if (modelId.toLowerCase().includes('mistral')) {
      snippets.push({
        title: 'Using Mistral Tokenizer',
        language: 'Python',
        code: `from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
from mistral_common.protocol.instruct.messages import UserMessage
from mistral_common.protocol.instruct.request import ChatCompletionRequest
from mistral_inference.transformer import Transformer
from mistral_inference.generate import generate

# Initialize tokenizer
tokenizer = MistralTokenizer.v1()

# Create completion request
completion_request = ChatCompletionRequest(
    messages=[UserMessage(content="Explain Machine Learning to me in a nutshell.")]
)

# Encode
tokens = tokenizer.encode_chat_completion(completion_request).tokens

# Load model and generate
model = Transformer.from_folder("path/to/model")
out_tokens, _ = generate(
    [tokens], 
    model, 
    max_tokens=64, 
    temperature=0.0, 
    eos_id=tokenizer.instruct_tokenizer.tokenizer.eos_id
)`,
        description: 'Official Mistral tokenizer and inference setup'
      });
    }

    // llama.cpp
    snippets.push({
      title: 'Local Inference with llama.cpp',
      language: 'Bash',
      code: `# Download and setup llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Run inference (requires GGUF format)
./main -m /path/to/model.gguf \\
  -p "Explain Machine Learning:" \\
  -n 256 \\
  --temp 0.7 \\
  --top-p 0.9 \\
  --repeat-penalty 1.1 \\
  -ngl 32`,
      description: 'Run the model locally using llama.cpp for efficient CPU/GPU inference'
    });

    // API usage
    snippets.push({
      title: 'Hugging Face Inference API',
      language: 'Python',
      code: `import requests

API_URL = "https://api-inference.huggingface.co/models/${modelId}"
headers = {"Authorization": "Bearer YOUR_HF_TOKEN"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

# Make request
output = query({
    "inputs": "Explain Machine Learning in a nutshell.",
    "parameters": {
        "max_new_tokens": 200,
        "temperature": 0.7,
        "top_p": 0.9
    }
})

print(output)`,
      description: 'Use the Hugging Face Inference API for quick testing without local setup'
    });

    // JavaScript/Node.js
    snippets.push({
      title: 'Node.js Integration',
      language: 'JavaScript',
      code: `const { HfInference } = require('@huggingface/inference');

// Initialize client
const hf = new HfInference('YOUR_HF_TOKEN');

// Generate text
async function generateText() {
  const result = await hf.textGeneration({
    model: '${modelId}',
    inputs: 'Explain Machine Learning in a nutshell.',
    parameters: {
      max_new_tokens: 200,
      temperature: 0.7,
      top_p: 0.9
    }
  });
  
  console.log(result.generated_text);
}

generateText();`,
      description: 'Use the Hugging Face JavaScript SDK for Node.js applications'
    });

    return modelData.codeSnippets || snippets;
  };

  const codeSnippets = generateCodeSnippets();

  // Group parameters by category
  const categorizedParams = {};

  if (modelData.config) {
    Object.entries(modelData.config).forEach(([key, value]) => {
      const explanation = getParameterExplanation(key);
      const category = explanation.category || 'Other';

      if (!categorizedParams[category]) {
        categorizedParams[category] = [];
      }

      categorizedParams[category].push({
        key,
        value,
        explanation
      });
    });
  }

  // Category display order and colors
  const categoryConfig = {
    'Architecture': { icon: '🏗️', color: 'purple' },
    'Memory': { icon: '💾', color: 'blue' },
    'Performance': { icon: '⚡', color: 'cyan' },
    'Context': { icon: '📄', color: 'green' },
    'Tokenization': { icon: '🔤', color: 'yellow' },
    'Advanced': { icon: '⚙️', color: 'orange' },
    'Generation': { icon: '✨', color: 'pink' },
    'Technical': { icon: '🔧', color: 'gray' },
    'Optimization': { icon: '🚀', color: 'emerald' },
    'Other': { icon: '📦', color: 'slate' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button and Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Search</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={() => onToggleFavorite(modelData)}
              size="lg"
            />

            <CompareButton
              modelId={modelData.modelId}
              isInComparison={isInComparison}
              onAdd={onAddToComparison}
              onRemove={onRemoveFromComparison}
              disabled={!canAddMore && !isInComparison}
            />
          </div>
        </div>

        {/* Model Header */}
        <div className="mb-6">
          <ModelHeader modelData={modelData} />
        </div>

        {/* Deprecation Warning */}
        {(notices.deprecation || modelData.deprecated) && (
          <div className="mb-6 bg-orange-500/10 backdrop-blur-sm border border-orange-500/30 rounded-xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-orange-200 font-semibold mb-2">Deprecated Model</h3>
              <div
                className="text-orange-100/90 text-sm leading-relaxed mb-3"
                dangerouslySetInnerHTML={{
                  __html: notices.deprecation?.message || modelData.deprecationMessage || 'This model has been deprecated. Please check for newer versions.'
                }}
              />
              {(notices.deprecation?.replacement || modelData.replacementModel) && (
                <a
                  href={(notices.deprecation?.replacement || modelData.replacementModel).url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-300 hover:text-orange-200 transition-colors font-medium"
                >
                  → View {(notices.deprecation?.replacement || modelData.replacementModel).name}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Important Notices */}
        {notices.general.length > 0 && (
          <div className="mb-6 space-y-3">
            {notices.general.map((notice, index) => (
              <div
                key={index}
                className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-5 flex items-start gap-4"
              >
                <Info className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-amber-100/90 text-sm leading-relaxed">
                    {notice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Notice */}
        {modelData.notice && !notices.deprecation && (
          <div className="mb-6 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5 flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div
                className="text-blue-100/90 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: modelData.notice }}
              />
            </div>
          </div>
        )}

        {/* Quick Decision Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            Quick Decision Panel
          </h2>
          <QuickDecisionPanel
            licenseInfo={modelData.licenseInfo}
            vramEstimates={modelData.vramEstimates}
          />
        </div>

        <div className="mb-8">
          <DeploymentScore modelData={modelData} />
        </div>

        {/* Code Snippets Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Code className="w-6 h-6 text-purple-400" />
            Usage Examples
          </h2>
          <div className="space-y-4">
            {codeSnippets.map((snippet, index) => (
              <div
                key={index}
                className="bg-slate-950/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-colors"
              >
                {/* Header */}
                <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">
                      {snippet.title}
                    </span>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                      {snippet.language}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(snippet.code, index)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code Block */}
                <div className="relative">
                  <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="text-gray-300 font-mono whitespace-pre">
                      {snippet.code}
                    </code>
                  </pre>
                </div>

                {/* Description */}
                {snippet.description && (
                  <div className="px-4 py-3 bg-blue-500/5 border-t border-white/10">
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                      💡 {snippet.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Recommendations */}
        <div className="mb-8">
          <HardwareRecommendations modelData={modelData} />
        </div>
        {/* COMPATIBILITY CHECKER - NEW */}
        <div className="mb-8">
          <CompatibilityChecker modelData={modelData} />
        </div>
        {allModels && allModels.length > 0 && (
          <div className="mb-8">
            <AlternativesSuggester
              modelData={modelData}
              allModels={allModels}
              onSelectModel={(modelId) => {
                // Navigate to the alternative model
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onBack(); // Go back to trigger re-search
                setTimeout(() => {
                  // Trigger search for new model
                  const searchEvent = new CustomEvent('searchModel', { detail: modelId });
                  window.dispatchEvent(searchEvent);
                }, 100);
              }}
            />
          </div>
        )}

        <div className="mb-8">
          <TCOCalculator modelData={modelData} />
        </div>
        <div className="mb-8">
          <BenchmarkVisualizer modelData={modelData} />
        </div>
        <div className="mb-8">
          <LiveModelTester modelData={modelData} />
        </div>



        {/* Parameters by Category */}
        {Object.keys(categorizedParams).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-400" />
              Model Parameters Explained
            </h2>

            <div className="space-y-8">
              {Object.entries(categorizedParams).map(([category, params]) => {
                const config = categoryConfig[category] || categoryConfig['Other'];

                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{config.icon}</span>
                      <h3 className="text-xl font-bold text-white">
                        {category}
                      </h3>
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-sm text-gray-400">
                        {params.length} {params.length === 1 ? 'parameter' : 'parameters'}
                      </span>
                    </div>

                    {/* Parameter Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {params.map((param) => (
                        <ParameterCard
                          key={param.key}
                          paramKey={param.key}
                          paramValue={param.value}
                          explanation={param.explanation}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Benchmarks (if available) */}
        {modelData.card?.benchmarks && Object.keys(modelData.card.benchmarks).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              Benchmark Scores
            </h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(modelData.card.benchmarks).map(([name, score]) => (
                  <div key={name} className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {typeof score === 'number' ? `${score}%` : score}
                    </div>
                    <div className="text-sm text-gray-400 uppercase">
                      {name.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Similar Models Radar Chart */}
        {similarModels.length >= 2 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              How This Compares to Similar Models
            </h2>
            <ModelRadarChart models={similarModels} />
          </div>
        )}
        {/* DECISION MATRIX - ADD THIS HERE */}
        {similarModels.length >= 2 && (
          <div className="mb-12">
            <DecisionMatrix models={similarModels} />
          </div>
        )}

        {/* Raw Config (Collapsible) */}
        {modelData.config && (
          <details className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <summary className="cursor-pointer p-4 hover:bg-white/5 transition-colors flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <span className="font-semibold text-white">View Raw Configuration (Advanced)</span>
            </summary>
            <div className="p-4 border-t border-white/10 bg-slate-950/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">Configuration JSON</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(modelData.config, null, 2));
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1 rounded hover:bg-white/5"
                >
                  Copy to clipboard
                </button>
              </div>
              <pre className="text-xs text-gray-300 overflow-auto whitespace-pre-wrap break-words max-h-96 bg-slate-900/50 p-4 rounded-lg">
                {JSON.stringify(modelData.config, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default ModelDetailPage;