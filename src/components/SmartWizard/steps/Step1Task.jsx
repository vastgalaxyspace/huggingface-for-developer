"use client";

import {
  ArrowRight,
  AudioLines,
  BadgeHelp,
  BookText,
  Brain,
  Captions,
  Code2,
  FileImage,
  FileSearch,
  Globe,
  Languages,
  LayoutTemplate,
  MessageSquareText,
  Mic,
  ScanSearch,
  SearchCheck,
  SlidersHorizontal,
  Sparkles,
  Speech,
  Tags,
  Workflow,
} from "lucide-react";
import { useMemo } from "react";
import SelectionGrid from "../shared/SelectionGrid";

const TASK_CATEGORIES = [
  { id: "nlp", label: "NLP / Text" },
  { id: "vision", label: "Vision" },
  { id: "audio", label: "Audio" },
  { id: "code", label: "Code" },
  { id: "multimodal", label: "Multimodal" },
];

const TASKS = {
  nlp: [
    { id: "text-generation", label: "Text Generation", icon: <MessageSquareText className="h-5 w-5" />, taskLabel: "Text Generation" },
    { id: "summarization", label: "Summarization", icon: <BookText className="h-5 w-5" />, taskLabel: "Summarization" },
    { id: "translation", label: "Translation", icon: <Languages className="h-5 w-5" />, taskLabel: "Translation" },
    { id: "question-answering", label: "Question Answering", icon: <BadgeHelp className="h-5 w-5" />, taskLabel: "Question Answering" },
    { id: "text-classification", label: "Classification", icon: <Tags className="h-5 w-5" />, taskLabel: "Classification" },
    { id: "feature-extraction", label: "Text Embedding", icon: <Brain className="h-5 w-5" />, taskLabel: "Text Embedding" },
    { id: "sentiment-analysis", label: "Sentiment Analysis", icon: <Sparkles className="h-5 w-5" />, taskLabel: "Sentiment Analysis" },
    { id: "token-classification", label: "Named Entity Rec.", icon: <Workflow className="h-5 w-5" />, taskLabel: "Named Entity Recognition" },
    { id: "sentence-similarity", label: "Reranking", icon: <SlidersHorizontal className="h-5 w-5" />, taskLabel: "Reranking" },
  ],
  vision: [
    { id: "image-classification", label: "Image Classification", icon: <FileImage className="h-5 w-5" /> },
    { id: "object-detection", label: "Object Detection", icon: <ScanSearch className="h-5 w-5" /> },
    { id: "text-to-image", label: "Image Generation", icon: <Sparkles className="h-5 w-5" /> },
    { id: "image-segmentation", label: "Image Segmentation", icon: <LayoutTemplate className="h-5 w-5" /> },
    { id: "image-to-text", label: "Image Captioning", icon: <Captions className="h-5 w-5" /> },
    { id: "document-question-answering", label: "OCR / Document AI", icon: <FileSearch className="h-5 w-5" /> },
  ],
  audio: [
    { id: "automatic-speech-recognition", label: "Speech Recognition", icon: <Mic className="h-5 w-5" /> },
    { id: "text-to-speech", label: "Text to Speech", icon: <Speech className="h-5 w-5" /> },
    { id: "audio-classification", label: "Audio Classification", icon: <AudioLines className="h-5 w-5" /> },
  ],
  code: [
    { id: "code-generation", label: "Code Generation", icon: <Code2 className="h-5 w-5" />, pipelineTag: "text-generation" },
    { id: "code-completion", label: "Code Completion", icon: <Code2 className="h-5 w-5" />, pipelineTag: "text-generation" },
    { id: "code-review", label: "Code Review / Analysis", icon: <SearchCheck className="h-5 w-5" />, pipelineTag: "text-generation" },
  ],
  multimodal: [
    { id: "image-text-to-text", label: "Vision + Language", icon: <Globe className="h-5 w-5" /> },
    { id: "document-question-answering", label: "Document QA", icon: <FileSearch className="h-5 w-5" /> },
    { id: "video-classification", label: "Video Understanding", icon: <FileImage className="h-5 w-5" /> },
  ],
};

const USE_CASES = [
  { id: "chatbot", label: "Chatbot" },
  { id: "rag", label: "RAG / Search" },
  { id: "summary", label: "Document Summary" },
  { id: "creative", label: "Creative Writing" },
  { id: "agents", label: "Agents" },
];

export default function Step1Task({ state, updateTask }) {
  const selectedCategory = state.task.category || "nlp";
  const taskOptions = TASKS[selectedCategory];
  const selectedTask = useMemo(
    () => taskOptions.find((task) => task.id === state.task.use_case),
    [state.task.use_case, taskOptions],
  );

  const handleTaskSelect = (taskId) => {
    const task = taskOptions.find((item) => item.id === taskId);

    updateTask({
      category: selectedCategory,
      use_case: taskId,
      primary_task: task?.pipelineTag || taskId,
      task_label: task?.taskLabel || task?.label,
      task_specific: {},
    });
  };

  const handleMultiSelect = (key, value) => {
    const current = state.task.task_specific[key] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateTask({
      task_specific: {
        ...state.task.task_specific,
        [key]: next,
      },
    });
  };

  const handleSingleSpecific = (key, value) => {
    updateTask({
      task_specific: {
        ...state.task.task_specific,
        [key]: value,
      },
    });
  };

  const isTextFlow = ["text-generation", "summarization", "question-answering"].includes(
    state.task.primary_task,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
          Step 1
        </p>
        <h2 className="mb-2 text-xl font-black text-slate-900">What Are You Building?</h2>
        <p className="mb-6 text-sm text-slate-500">
          Start with a task family, then add context so the recommender can narrow the field.
        </p>

        {/* Category tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TASK_CATEGORIES.map((category) => {
            const active = category.id === selectedCategory;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  updateTask({
                    category: category.id,
                    use_case: null,
                    primary_task: null,
                    task_label: null,
                    task_specific: {},
                  })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300 hover:text-blue-600"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <SelectionGrid
          options={taskOptions}
          selected={state.task.use_case}
          onSelect={handleTaskSelect}
        />
      </section>

      {selectedTask ? (
        <section className="space-y-6 border-t border-slate-200/60 pt-8 transition-all duration-300">
          {isTextFlow ? (
            <>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Use Case
                </p>
                <SelectionGrid
                  options={USE_CASES}
                  selected={state.task.task_specific.use_cases || []}
                  onSelect={(value) => handleMultiSelect("use_cases", value)}
                  multiSelect
                  columns="sm:grid-cols-2 lg:grid-cols-5"
                />
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Language
                </p>
                <SelectionGrid
                  options={[
                    { id: "english", label: "English" },
                    { id: "multilingual", label: "Multilingual" },
                    { id: "specific", label: "Specific Language", icon: <ArrowRight className="h-4 w-4" /> },
                  ]}
                  selected={state.task.language}
                  onSelect={(value) => updateTask({ language: value })}
                  columns="sm:grid-cols-3"
                />
                {state.task.language === "specific" ? (
                  <input
                    type="text"
                    value={state.task.task_specific.specific_language || ""}
                    onChange={(event) => handleSingleSpecific("specific_language", event.target.value)}
                    placeholder="Enter language name"
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                ) : null}
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Context Length Needed
                </p>
                <SelectionGrid
                  options={[
                    { id: "<4k", label: "< 4K tokens" },
                    { id: "4k-32k", label: "4K – 32K" },
                    { id: "32k-128k", label: "32K – 128K" },
                    { id: "128k+", label: "128K+" },
                  ]}
                  selected={state.task.context_length}
                  onSelect={(value) => updateTask({ context_length: value })}
                  columns="sm:grid-cols-2 lg:grid-cols-4"
                />
              </div>
            </>
          ) : null}

          {state.task.primary_task === "text-to-image" ? (
            <>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Style
                </p>
                <SelectionGrid
                  options={[
                    { id: "photo", label: "Photorealistic" },
                    { id: "art", label: "Artistic / Stylized" },
                    { id: "technical", label: "Technical / Diagram" },
                    { id: "product", label: "Product Photo" },
                  ]}
                  selected={state.task.task_specific.style}
                  onSelect={(value) => handleSingleSpecific("style", value)}
                  columns="sm:grid-cols-2 lg:grid-cols-4"
                />
              </div>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Base Resolution
                </p>
                <SelectionGrid
                  options={[
                    { id: "512", label: "512×512" },
                    { id: "1024", label: "1024×1024" },
                    { id: "high", label: "Higher Resolution" },
                  ]}
                  selected={state.task.task_specific.resolution}
                  onSelect={(value) => handleSingleSpecific("resolution", value)}
                  columns="sm:grid-cols-3"
                />
              </div>
            </>
          ) : null}

          {state.task.primary_task === "automatic-speech-recognition" ? (
            <>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Language Count
                </p>
                <SelectionGrid
                  options={[
                    { id: "single", label: "Single Language" },
                    { id: "multilingual", label: "Multilingual" },
                  ]}
                  selected={state.task.task_specific.language_count}
                  onSelect={(value) => handleSingleSpecific("language_count", value)}
                  columns="sm:grid-cols-2"
                />
              </div>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Audio Quality
                </p>
                <SelectionGrid
                  options={[
                    { id: "clean", label: "Clean Studio" },
                    { id: "noisy", label: "Noisy / Real-world" },
                    { id: "accented", label: "Accented" },
                    { id: "medical", label: "Medical / Domain-specific" },
                  ]}
                  selected={state.task.task_specific.audio_quality}
                  onSelect={(value) => handleSingleSpecific("audio_quality", value)}
                  columns="sm:grid-cols-2 lg:grid-cols-4"
                />
              </div>
            </>
          ) : null}

          {selectedCategory === "code" ? (
            <>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Language
                </p>
                <SelectionGrid
                  options={[
                    { id: "python", label: "Python" },
                    { id: "javascript", label: "JavaScript" },
                    { id: "multi", label: "Multiple Languages" },
                    { id: "domain", label: "Domain-specific" },
                  ]}
                  selected={state.task.language}
                  onSelect={(value) => updateTask({ language: value })}
                  columns="sm:grid-cols-2 lg:grid-cols-4"
                />
              </div>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Task Detail
                </p>
                <SelectionGrid
                  options={[
                    { id: "autocomplete", label: "Autocomplete" },
                    { id: "docstring", label: "Generate from docstring" },
                    { id: "explain", label: "Explain code" },
                    { id: "review", label: "Review / Debug" },
                  ]}
                  selected={state.task.task_specific.code_task}
                  onSelect={(value) => handleSingleSpecific("code_task", value)}
                  columns="sm:grid-cols-2"
                />
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
