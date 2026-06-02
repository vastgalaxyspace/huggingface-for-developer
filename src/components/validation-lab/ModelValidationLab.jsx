"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clipboard,
  Code2,
  Cpu,
  ExternalLink,
  FlaskConical,
  Heart,
  Loader2,
  Plus,
  Scale,
  Server,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import ModelSelector from "../ModelSelector";
import { fetchCompleteModelData } from "../../services/huggingface";
import { enrichModelData, formatNumber } from "../../utils/modelUtils";
import { useComparison } from "../../hooks/useComparison";
import { useFavorites } from "../../hooks/useFavorites";
import { notify } from "../../lib/notifications";

const MAX_MODELS = 3;
const NOTES_KEY = "innoai_validation_lab_notes";

const DEFAULT_PROMPTS = [
  "Summarize the tradeoffs of running a 7B model locally versus through an API.",
  "Write a Python function that validates an email address and explain the edge cases.",
  "Extract the key risks from this deployment plan and suggest mitigations.",
  "Answer as a concise technical assistant: when should I use quantization?",
];

const FRAMEWORKS = [
  { id: "transformers", label: "Transformers", icon: Code2 },
  { id: "vllm", label: "vLLM Server", icon: Server },
  { id: "llamacpp", label: "llama.cpp", icon: Terminal },
  { id: "hfapi", label: "HF API", icon: ExternalLink },
];

const precisionProfiles = {
  fp16: { label: "FP16", multiplier: 1 },
  int8: { label: "INT8", multiplier: 0.55 },
  int4: { label: "INT4", multiplier: 0.3 },
};

const toPromptLiteral = (prompt) => JSON.stringify(prompt || "Hello, test this model briefly.");

const getVramForPrecision = (model, precision) => {
  const fp16 = Number(model?.vramEstimates?.fp16 || 0);
  if (!fp16) return null;
  return Number((fp16 * precisionProfiles[precision].multiplier).toFixed(1));
};

const getFitLabel = (vram) => {
  if (!vram) return { label: "Unknown fit", tone: "muted", detail: "Parameter data is incomplete." };
  if (vram <= 8) return { label: "Consumer GPU", tone: "good", detail: "Likely workable on 8 GB class hardware with care." };
  if (vram <= 24) return { label: "Prosumer GPU", tone: "good", detail: "Fits common 16-24 GB cards depending on context and batch size." };
  if (vram <= 80) return { label: "Server GPU", tone: "warn", detail: "Plan for workstation or datacenter GPUs." };
  return { label: "Multi-GPU", tone: "danger", detail: "Requires sharding or hosted infrastructure." };
};

const buildSnippet = ({ modelId, prompt, framework, precision, maxTokens, temperature, contextLength }) => {
  const promptLiteral = toPromptLiteral(prompt);
  const quantized = precision !== "fp16";

  if (framework === "vllm") {
    return `# Install: pip install vllm
# Serve an OpenAI-compatible endpoint
vllm serve ${modelId} \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --max-model-len ${contextLength} \\
  --gpu-memory-utilization 0.90

# Test the endpoint
curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "messages": [{"role": "user", "content": ${promptLiteral}}],
    "max_tokens": ${maxTokens},
    "temperature": ${temperature}
  }'`;
  }

  if (framework === "llamacpp") {
    return `# Best for GGUF models. Download a compatible .gguf file first.
# Example:
# huggingface-cli download ${modelId} --include "*.gguf" --local-dir ./model

llama-cli \\
  -m ./model/model.gguf \\
  -p ${promptLiteral} \\
  -n ${maxTokens} \\
  --temp ${temperature} \\
  -c ${contextLength}

# For a local API server:
# llama-server -m ./model/model.gguf -c ${contextLength} --host 0.0.0.0 --port 8080`;
  }

  if (framework === "hfapi") {
    return `curl https://api-inference.huggingface.co/models/${modelId} \\
  -X POST \\
  -H "Authorization: Bearer YOUR_HF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": ${promptLiteral},
    "parameters": {
      "max_new_tokens": ${maxTokens},
      "temperature": ${temperature},
      "return_full_text": false
    }
  }'`;
  }

  return `# Install: pip install transformers accelerate torch${quantized ? " bitsandbytes" : ""}
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_id = "${modelId}"
prompt = ${promptLiteral}

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    ${quantized ? "load_in_4bit=True," : "torch_dtype=torch.float16,"}
)

messages = [{"role": "user", "content": prompt}]
if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template:
    input_ids = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to(model.device)
else:
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(model.device)

outputs = model.generate(
    input_ids,
    max_new_tokens=${maxTokens},
    temperature=${temperature},
    do_sample=True,
)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))`;
};

const loadNotes = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  } catch {
    return {};
  }
};

function ModelSummaryCard({ item, selected, onSelect, onRemove, onFavorite, favorite, onCompare, inComparison }) {
  const model = item.data;
  const vram = getVramForPrecision(model, "fp16");
  const fit = getFitLabel(vram);
  const fitClasses = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warn: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    muted: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
        selected ? "border-[#274867] ring-4 ring-[#274867]/10" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onSelect} className="min-w-0 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Test candidate</p>
          <h3 className="mt-2 break-words text-lg font-black tracking-tight text-gray-900">{model.modelId}</h3>
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${model.modelId}`}
          className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Params</p>
          <p className="mt-1 text-sm font-black text-gray-900">{model.rawParams || "Unknown"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">FP16 VRAM</p>
          <p className="mt-1 text-sm font-black text-gray-900">{vram ? `${vram} GB` : "Unknown"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Context</p>
          <p className="mt-1 text-sm font-black text-gray-900">{model.config?.max_position_embeddings?.toLocaleString() || "Unknown"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Downloads</p>
          <p className="mt-1 text-sm font-black text-gray-900">{formatNumber(model.downloads || 0)}</p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl border px-3 py-2 text-xs font-bold ${fitClasses[fit.tone]}`}>
        {fit.label}: <span className="font-semibold">{fit.detail}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onFavorite}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
            favorite ? "border-rose-200 bg-rose-50 text-rose-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart className="h-3.5 w-3.5" /> {favorite ? "Saved" : "Favorite"}
        </button>
        <button
          type="button"
          onClick={onCompare}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
            inComparison ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Scale className="h-3.5 w-3.5" /> {inComparison ? "In Compare" : "Compare"}
        </button>
      </div>
    </article>
  );
}

export default function ModelValidationLab() {
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPTS[0]);
  const [framework, setFramework] = useState("transformers");
  const [precision, setPrecision] = useState("fp16");
  const [maxTokens, setMaxTokens] = useState(512);
  const [temperature, setTemperature] = useState(0.7);
  const [notes, setNotes] = useState({});
  const [copied, setCopied] = useState(false);
  const { addToComparison, isInComparison, canAddMore } = useComparison();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const activeItem = items.find((item) => item.id === activeId && item.data);
  const activeModel = activeItem?.data;
  const contextLength = activeModel?.config?.max_position_embeddings || 4096;
  const activeVram = getVramForPrecision(activeModel, precision);
  const activeFit = getFitLabel(activeVram);

  const snippet = useMemo(() => {
    if (!activeModel) return "";
    return buildSnippet({
      modelId: activeModel.modelId,
      prompt,
      framework,
      precision,
      maxTokens,
      temperature,
      contextLength,
    });
  }, [activeModel, contextLength, framework, maxTokens, precision, prompt, temperature]);

  const addModel = async (modelId) => {
    if (items.some((item) => item.id === modelId)) {
      setActiveId(modelId);
      setAdding(false);
      return;
    }

    if (items.length >= MAX_MODELS) {
      notify(`You can test up to ${MAX_MODELS} models at once.`, "info");
      return;
    }

    setAdding(false);
    setItems((current) => [...current, { id: modelId, loading: true, error: "" }]);
    setActiveId(modelId);

    try {
      const fullData = await fetchCompleteModelData(modelId);
      const enriched = enrichModelData({
        ...fullData.metadata,
        id: fullData.metadata.id || modelId,
        rawConfig: fullData.config,
        config: fullData.config,
      });
      enriched.rawData = fullData;

      setItems((current) =>
        current.map((item) =>
          item.id === modelId ? { id: modelId, loading: false, error: "", data: enriched } : item
        )
      );
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item.id === modelId
            ? { id: modelId, loading: false, error: error.message || "Failed to load model." }
            : item
        )
      );
      notify("Could not load that model. Check the ID and try again.", "error");
    }
  };

  const removeModel = (modelId) => {
    setItems((current) => current.filter((item) => item.id !== modelId));
    if (activeId === modelId) {
      const next = items.find((item) => item.id !== modelId);
      setActiveId(next?.id || "");
    }
  };

  const copySnippet = async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    notify("Validation code copied.", "success");
    setTimeout(() => setCopied(false), 1800);
  };

  const addActiveToCompare = () => {
    if (!activeModel) return;
    if (!canAddMore && !isInComparison(activeModel.modelId)) {
      notify("Comparison list is full.", "info");
      return;
    }
    addToComparison(activeModel.modelId);
    notify("Model added to comparison.", "success");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#274867]">Model Validation Lab</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
              Test prompts before you commit
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
              Build a practical validation pack for up to three Hugging Face models: prompt, runtime path, precision,
              VRAM warning, runnable code, and notes for the final decision.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            disabled={items.length >= MAX_MODELS}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#274867] px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#18324f] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Plus className="h-4 w-4" /> Add Model
          </button>
        </div>
      </section>

      {adding ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <ModelSelector
            onSelect={addModel}
            onCancel={() => setAdding(false)}
            placeholder="Search models to validate..."
          />
        </section>
      ) : null}

      {items.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-14 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-[#274867]" />
          <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900">Add a model to start validating</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600">
            Search for an exact Hugging Face model ID, then generate test code and record deployment notes.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#274867] px-5 py-3 text-sm font-black text-white"
          >
            <Plus className="h-4 w-4" /> Choose First Model
          </button>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <div className="space-y-4">
            {items.map((item) =>
              item.loading ? (
                <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-[#274867]" />
                    Loading {item.id}
                  </div>
                </article>
              ) : item.error ? (
                <article key={item.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-rose-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{item.id}</p>
                      <p className="mt-1 text-sm">{item.error}</p>
                    </div>
                    <button type="button" onClick={() => removeModel(item.id)} className="rounded-lg p-1 hover:bg-white/70">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ) : (
                <ModelSummaryCard
                  key={item.id}
                  item={item}
                  selected={activeId === item.id}
                  onSelect={() => setActiveId(item.id)}
                  onRemove={() => removeModel(item.id)}
                  favorite={isFavorite(item.data.modelId)}
                  onFavorite={() => toggleFavorite(item.data)}
                  inComparison={isInComparison(item.data.modelId)}
                  onCompare={() => addToComparison(item.data.modelId)}
                />
              )
            )}
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Validation prompt</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                    {activeModel ? activeModel.modelId : "Select a loaded model"}
                  </h2>
                </div>
                {activeModel ? (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/model/${activeModel.modelId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                      Model Page <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/gpu/tools/gpu-picker?model=${encodeURIComponent(activeModel.modelId)}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                      GPU Picker <Cpu className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : null}
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="mt-5 w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition-colors focus:border-[#274867] focus:bg-white"
                placeholder="Enter the prompt you want to validate..."
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {DEFAULT_PROMPTS.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setPrompt(sample)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs font-semibold text-gray-600 hover:bg-slate-50"
                  >
                    {sample.slice(0, 58)}...
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Runtime</span>
                  <div className="grid grid-cols-2 gap-2">
                    {FRAMEWORKS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFramework(option.id)}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black ${
                            framework === option.id
                              ? "border-[#274867] bg-[#eef4fb] text-[#274867]"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" /> {option.label}
                        </button>
                      );
                    })}
                  </div>
                </label>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Precision</span>
                    <select
                      value={precision}
                      onChange={(event) => setPrecision(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#274867]"
                    >
                      {Object.entries(precisionProfiles).map(([id, option]) => (
                        <option key={id} value={id}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Max Tokens</span>
                      <input
                        type="number"
                        min="32"
                        max="4096"
                        value={maxTokens}
                        onChange={(event) => setMaxTokens(Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#274867]"
                      />
                    </label>
                    <label>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Temperature</span>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(event) => setTemperature(Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#274867]"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {activeModel ? (
                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-black">
                        Estimated {precisionProfiles[precision].label} memory: {activeVram ? `${activeVram} GB` : "unknown"} ({activeFit.label})
                      </p>
                      <p className="mt-1 leading-6">
                        {activeFit.detail} Leave extra room for KV cache, framework overhead, and concurrent requests.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Runnable validation code</p>
                  <h2 className="mt-1 text-lg font-black text-gray-900">{FRAMEWORKS.find((option) => option.id === framework)?.label}</h2>
                </div>
                <button
                  type="button"
                  onClick={copySnippet}
                  disabled={!snippet}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#274867] px-4 py-2.5 text-xs font-black text-white disabled:bg-gray-300"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy Code"}
                </button>
              </div>
              <pre className="max-h-[520px] overflow-auto bg-[#101827] p-5 text-sm leading-6 text-slate-100">
                <code>{snippet || "Load a model to generate validation code."}</code>
              </pre>
            </section>

            {activeModel ? (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Decision notes</p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-gray-900">Record what you learned</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addActiveToCompare}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-gray-50"
                  >
                    <Scale className="h-4 w-4" /> Send to Compare
                  </button>
                </div>
                <textarea
                  value={notes[activeModel.modelId] || ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [activeModel.modelId]: event.target.value }))
                  }
                  rows={4}
                  className="mt-4 w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-gray-800 outline-none focus:border-[#274867] focus:bg-white"
                  placeholder="Example: strong code answers, weak long-context behavior, needs INT4 to fit 12 GB GPU..."
                />
              </section>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
