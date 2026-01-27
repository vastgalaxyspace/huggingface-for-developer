import { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { generateCodeSnippet, getCompatibleFrameworks } from '../../utils/codeGenerator';

const CodeSnippets = ({ modelData }) => {
  const [selectedFramework, setSelectedFramework] = useState('transformers');
  const [copied, setCopied] = useState(false);

  const frameworks = getCompatibleFrameworks(modelData);
  const code = generateCodeSnippet(modelData, selectedFramework);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Code Snippets
            </h2>
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Framework Tabs */}
        <div className="flex gap-2 flex-wrap">
          {frameworks.map((framework) => (
            <button
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                selectedFramework === framework.id
                  ? 'bg-purple-500/30 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{framework.icon}</span>
              <span className="font-semibold text-sm">{framework.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Framework Description */}
      <div className="bg-black/20 px-6 py-3 border-b border-white/10">
        <p className="text-sm text-gray-300">
          {frameworks.find(f => f.id === selectedFramework)?.description}
        </p>
      </div>

      {/* Code Block */}
      <div className="relative">
        <pre className="p-6 overflow-x-auto text-sm">
          <code className="text-gray-300 font-mono">
            {code}
          </code>
        </pre>
      </div>

      {/* Installation Instructions */}
      <div className="border-t border-white/10 p-6 bg-black/20">
        <h3 className="text-sm font-semibold text-white mb-2">
          📦 Installation
        </h3>
        <pre className="text-xs text-gray-400 font-mono bg-black/30 p-3 rounded-lg overflow-x-auto">
          {getInstallCommand(selectedFramework)}
        </pre>
      </div>
    </div>
  );
};

// Installation commands
const getInstallCommand = (framework) => {
  const commands = {
    transformers: 'pip install transformers torch accelerate',
    vllm: 'pip install vllm',
    ollama: 'curl -fsSL https://ollama.ai/install.sh | sh',
    llamacpp: 'pip install llama-cpp-python',
    curl: '# No installation needed - use curl or any HTTP client'
  };
  
  return commands[framework] || commands.transformers;
};

export default CodeSnippets;