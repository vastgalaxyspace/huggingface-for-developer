"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'selection_pitfalls_worksheet_v1';
const metricKeys = ['correctness', 'latency', 'cost', 'fit', 'security'];

const metricLabels = {
  correctness: 'Correctness',
  latency: 'Latency',
  cost: 'Cost',
  fit: 'Codebase Fit',
  security: 'Security',
};

const defaultWeights = {
  correctness: 35,
  latency: 20,
  cost: 15,
  fit: 20,
  security: 10,
};

const defaultModels = [
  { id: 'model-a', name: 'Model A', correctness: 8, latency: 7, cost: 6, fit: 8, security: 7 },
  { id: 'model-b', name: 'Model B', correctness: 7, latency: 9, cost: 8, fit: 6, security: 6 },
  { id: 'model-c', name: 'Model C', correctness: 9, latency: 5, cost: 5, fit: 9, security: 8 },
];

function clampScore(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(10, numeric));
}

function buildModelId() {
  return `model-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function normalizeImported(data) {
  if (!data || typeof data !== 'object') return null;

  const importedWeights = data.weights || {};
  const weights = metricKeys.reduce((acc, key) => {
    acc[key] = Math.max(0, Number(importedWeights[key] ?? defaultWeights[key] ?? 0));
    return acc;
  }, {});

  if (!Array.isArray(data.models)) return null;

  const models = data.models.map((item, index) => ({
    id: String(item.id || `imported-${index}`),
    name: String(item.name || `Model ${index + 1}`),
    correctness: clampScore(item.correctness),
    latency: clampScore(item.latency),
    cost: clampScore(item.cost),
    fit: clampScore(item.fit),
    security: clampScore(item.security),
  }));

  if (models.length === 0) return null;
  return { weights, models };
}

export default function SelectionPitfallsWorksheet() {
  const [weights, setWeights] = useState(defaultWeights);
  const [models, setModels] = useState(defaultModels);
  const [isHydrated, setIsHydrated] = useState(false);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Load persisted worksheet after mount to avoid server/client hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw);
      const normalized = normalizeImported(parsed);
      if (normalized) {
        setWeights(normalized.weights);
        setModels(normalized.models);
      }
      setIsHydrated(true);
    } catch {
      setIsHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isHydrated) return;
    const payload = { weights, models };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [weights, models, isHydrated]);

  const totalWeight = useMemo(
    () => metricKeys.reduce((sum, key) => sum + Number(weights[key] || 0), 0),
    [weights],
  );

  const rankedModels = useMemo(() => {
    return models
      .map((model) => {
        const weighted = metricKeys.reduce(
          (sum, key) => sum + clampScore(model[key]) * Number(weights[key] || 0),
          0,
        );
        const scoreOutOf10 = totalWeight > 0 ? weighted / totalWeight : 0;
        return { ...model, scoreOutOf10 };
      })
      .sort((a, b) => b.scoreOutOf10 - a.scoreOutOf10);
  }, [models, weights, totalWeight]);

  const updateWeight = (key, value) => {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Number(value) || 0) }));
  };

  const updateModelScore = (id, key, value) => {
    setModels((prev) =>
      prev.map((model) => (model.id === id ? { ...model, [key]: clampScore(value) } : model)),
    );
  };

  const updateModelName = (id, value) => {
    setModels((prev) =>
      prev.map((model) => (model.id === id ? { ...model, name: value || 'Untitled Model' } : model)),
    );
  };

  const addModel = () => {
    setModels((prev) => [
      ...prev,
      { id: buildModelId(), name: `Model ${prev.length + 1}`, correctness: 5, latency: 5, cost: 5, fit: 5, security: 5 },
    ]);
  };

  const removeModel = (id) => {
    setModels((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((model) => model.id !== id);
    });
  };

  const resetDefaults = () => {
    setWeights(defaultWeights);
    setModels(defaultModels);
    setImportText('');
    setMessage('Reset to default worksheet values.');
  };

  const exportJson = () => {
    const payload = { weights, models };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'selection-pitfalls-worksheet.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Worksheet exported as JSON.');
  };

  const applyImport = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const normalized = normalizeImported(parsed);
      if (!normalized) {
        setMessage('Import failed: JSON format is not valid for this worksheet.');
        return;
      }
      setWeights(normalized.weights);
      setModels(normalized.models);
      setMessage('Worksheet imported successfully.');
    } catch {
      setMessage('Import failed: invalid JSON.');
    }
  };

  const importFromText = () => {
    applyImport(importText);
  };

  const importFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    applyImport(text);
    event.target.value = '';
  };

  return (
    <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-white p-4">
      <h3 className="text-base font-black text-[var(--text-strong)]">Interactive Evaluation Worksheet</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Use this to compare models with your own weights, then export and share the decision file with your team.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addModel}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-white"
        >
          Add Model
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-white"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-white"
        >
          Import JSON File
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-white"
        >
          Reset Defaults
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={importFromFile}
          className="hidden"
        />
      </div>

      {message ? (
        <p className="mt-2 text-xs font-semibold text-[var(--accent)]">{message}</p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {metricKeys.map((key) => (
          <label key={key} className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)]">
              <span>{metricLabels[key]} Weight</span>
              <span>{weights[key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={weights[key]}
              onChange={(e) => updateWeight(key, e.target.value)}
              className="mt-2 w-full"
            />
          </label>
        ))}
      </div>

      <div className="mt-3 text-xs font-semibold">
        <span className={totalWeight === 100 ? 'text-green-700' : 'text-amber-700'}>
          Total weight: {totalWeight}% {totalWeight === 100 ? '(Balanced)' : '(Target: 100%)'}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-soft)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.1em] text-[var(--text-faint)]">
            <tr>
              <th className="px-3 py-2 font-bold">Model</th>
              {metricKeys.map((key) => (
                <th key={key} className="px-3 py-2 font-bold">
                  {metricLabels[key]}
                </th>
              ))}
              <th className="px-3 py-2 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id} className="border-t border-[var(--border-soft)]">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={model.name}
                    onChange={(e) => updateModelName(model.id, e.target.value)}
                    className="w-36 rounded-md border border-[var(--border-soft)] px-2 py-1 text-xs font-semibold text-[var(--text-strong)]"
                  />
                </td>
                {metricKeys.map((key) => (
                  <td key={key} className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      value={model[key]}
                      onChange={(e) => updateModelScore(model.id, key, e.target.value)}
                      className="w-16 rounded-md border border-[var(--border-soft)] px-2 py-1 text-xs"
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeModel(model.id)}
                    disabled={models.length <= 1}
                    className="rounded-md border border-[var(--border-soft)] px-2 py-1 text-xs font-semibold text-[var(--text-main)] disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-[var(--text-main)]">Import JSON (paste and apply)</p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={5}
          placeholder='{"weights": {...}, "models": [...]}'
          className="mt-2 w-full rounded-lg border border-[var(--border-soft)] p-2 text-xs"
        />
        <button
          type="button"
          onClick={importFromText}
          className="mt-2 rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-white"
        >
          Apply Pasted JSON
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {rankedModels.map((model, idx) => (
          <article
            key={model.id}
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] p-3"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-faint)]">
              Rank #{idx + 1}
            </p>
            <p className="mt-1 text-sm font-black text-[var(--text-strong)]">{model.name}</p>
            <p className="mt-1 text-xs text-[var(--text-main)]">
              Weighted Score: {model.scoreOutOf10.toFixed(2)} / 10
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
