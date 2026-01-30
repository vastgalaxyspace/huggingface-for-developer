import { useState } from 'react';
import { Play, Copy, Check, ExternalLink, Info } from 'lucide-react';

const LiveModelTester = ({ modelData }) => {
  const [prompt, setPrompt] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const examplePrompts = [
    'Explain quantum computing in simple terms',
    'Write a Python function to reverse a string',
    'What are the key differences between React and Vue?',
    'Explain the importance of clean code'
  ];

  const generateTestCode = () => {
    return `# Test ${modelData.modelId} locally
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load model
tokenizer = AutoTokenizer.from_pretrained("${modelData.modelId}")
model = AutoModelForCausalLM.from_pretrained(
    "${modelData.modelId}",
    torch_dtype=torch.float16,
    device_map="auto"
)

# Your prompt
prompt = "${prompt || 'Hello! How are you?'}"

# Generate
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(
    **inputs,
    max_new_tokens=256,
    temperature=0.7,
    top_p=0.9,
    do_sample=True
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateTestCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Play className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">
            Test This Model
          </h2>
        </div>
        <p className="text-gray-400">
          Generate code to test this model locally or use HuggingFace Spaces
        </p>
      </div>

      {/* Prompt Input */}
      <div className="p-6 border-b border-white/10">
        <label className="block text-sm font-semibold text-white mb-2">
          Your Test Prompt:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to test the model..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={3}
        />
        
        {/* Example Prompts */}
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-2">Quick examples:</div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(example)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Code */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Python Test Code:</h3>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-all"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>

        <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm text-gray-300 font-mono">
            {generateTestCode()}
          </code>
        </pre>
      </div>

      {/* Test Options */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HuggingFace Spaces */}
        
         <a
          href={`https://huggingface.co/${modelData.modelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl hover:from-blue-500/20 hover:to-cyan-500/20 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
              Try on HuggingFace
            </h4>
            <p className="text-sm text-gray-400">
              Test the model directly in your browser using HuggingFace Spaces (if available)
            </p>
          </div>
        </a>

        {/* Local Testing */}
        <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1">
              Run Locally
            </h4>
            <p className="text-sm text-gray-400">
              Copy the code above and run it on your own GPU for full control and privacy
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-black/20 p-4 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <strong className="text-white">Note:</strong> This generates test code for local execution. 
          For production use, consider using vLLM for better performance, or managed API services for easier scaling.
          You'll need {modelData.vramEstimates?.fp16}GB VRAM to run this model in FP16.
        </div>
      </div>
    </div>
  );
};

export default LiveModelTester;