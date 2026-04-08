import { useState } from 'react';
import { Cpu, Layers, Grid3X3, Zap, Database, ChevronRight, X } from 'lucide-react';

const SM_COMPONENTS = [
  {
    id: 'warp-scheduler',
    label: 'Warp Scheduler',
    shortLabel: 'Warp Sched.',
    icon: Layers,
    color: '#6366f1',
    colorLight: 'rgba(99,102,241,0.08)',
    colorBorder: 'rgba(99,102,241,0.22)',
    row: 'top',
    description: 'The "traffic cop" of the SM. Threads are managed in groups of 32 called warps.',
    details: [
      'Decides which warp is ready to execute next and issues instructions to CUDA or Tensor cores.',
      'If one warp stalls waiting for memory, the scheduler instantly swaps it for a ready warp — keeping hardware fully utilized.',
      'Modern GPUs feature multiple warp schedulers per SM for higher instruction throughput.'
    ]
  },
  {
    id: 'register-file',
    label: 'Register File',
    shortLabel: 'Registers',
    icon: Database,
    color: '#0ea5e9',
    colorLight: 'rgba(14,165,233,0.08)',
    colorBorder: 'rgba(14,165,233,0.22)',
    row: 'upper',
    description: 'The fastest memory on the GPU, located directly within the SM.',
    details: [
      'Stores local variables and data for each individual thread.',
      'Massive compared to CPU register sets — supports thousands of concurrent threads.',
      'Too many registers per thread reduces occupancy, known as "register pressure".'
    ]
  },
  {
    id: 'cuda-cores',
    label: 'CUDA Cores',
    shortLabel: 'CUDA',
    icon: Grid3X3,
    color: '#22c55e',
    colorLight: 'rgba(34,197,94,0.08)',
    colorBorder: 'rgba(34,197,94,0.22)',
    row: 'middle',
    description: 'The standard "worker bees" — general-purpose math units.',
    details: [
      'Execute single-precision floating-point (FP32) and integer (INT32) arithmetic.',
      'Handle nearly every workload: rendering, physics simulations, general compute.',
      'Each SM contains dozens to over a hundred CUDA cores depending on architecture.'
    ]
  },
  {
    id: 'tensor-cores',
    label: 'Tensor Cores',
    shortLabel: 'Tensor',
    icon: Zap,
    color: '#f59e0b',
    colorLight: 'rgba(245,158,11,0.08)',
    colorBorder: 'rgba(245,158,11,0.22)',
    row: 'middle',
    description: 'Specialized hardware for deep learning and matrix math.',
    details: [
      'Multiply and add entire matrices in a single clock cycle (Fused Multiply-Add).',
      'The reason modern AI (Gemini, ChatGPT) runs fast — purpose-built for transformer ops.',
      'Also power DLSS in gaming, upscaling lower-resolution images via deep learning.'
    ]
  },
  {
    id: 'l1-shared',
    label: 'L1 Cache / Shared Memory',
    shortLabel: 'L1 / SMEM',
    icon: Cpu,
    color: '#a855f7',
    colorLight: 'rgba(168,85,247,0.08)',
    colorBorder: 'rgba(168,85,247,0.22)',
    row: 'bottom',
    description: 'The SM\'s "scratchpad" — bridging cores and global memory.',
    details: [
      'L1 Cache automatically stores frequently accessed data, reducing VRAM latency.',
      'Shared Memory is a user-defined space for ultra-fast inter-thread communication within a block.',
      'In modern architectures (Hopper, Blackwell), L1 and Shared Memory share the same physical pool — developers choose the split.'
    ]
  }
];

/* ── Tiny grid of dots representing core units ── */
const CoreGrid = ({ count, color, size = 6, gap = 3 }) => (
  <div className="flex flex-wrap justify-center" style={{ gap }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-sm sm-core-dot"
        style={{
          width: size,
          height: size,
          background: color,
          opacity: 0.55 + ((i % 5) * 0.07),
          animationDelay: `${i * 60}ms`,
        }}
      />
    ))}
  </div>
);

/* ── Data-flow connector line ── */
const Connector = ({ color = 'var(--border-soft)' }) => (
  <div className="flex justify-center py-1">
    <div className="sm-connector" style={{ borderColor: color }} />
  </div>
);

/* ── Detail Panel (slide-in) ── */
const DetailPanel = ({ comp, onClose }) => {
  const Icon = comp.icon;
  return (
    <div
      className="sm-detail-panel"
      style={{ borderColor: comp.colorBorder, background: `linear-gradient(135deg, ${comp.colorLight}, white)` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: comp.colorLight, border: `1px solid ${comp.colorBorder}` }}
          >
            <Icon className="h-4 w-4" style={{ color: comp.color }} />
          </div>
          <h4 className="text-[14px] font-bold text-[var(--text-strong)]">{comp.label}</h4>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:bg-[rgba(0,0,0,0.06)] hover:text-[var(--text-strong)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[12px] font-medium text-[var(--text-muted)] mb-3 leading-relaxed">{comp.description}</p>
      <ul className="space-y-2">
        {comp.details.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--text-main)] leading-relaxed">
            <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: comp.color }} />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ── Single SM Block Card ── */
const SMBlock = ({ comp, isActive, onClick }) => {
  const Icon = comp.icon;
  const isMiddle = comp.row === 'middle';

  return (
    <button
      onClick={onClick}
      className={`sm-block group relative text-left transition-all duration-300 ${isActive ? 'sm-block-active' : ''}`}
      style={{
        '--block-color': comp.color,
        '--block-light': comp.colorLight,
        '--block-border': comp.colorBorder,
        borderColor: isActive ? comp.color : 'var(--border-soft)',
        background: isActive
          ? `linear-gradient(135deg, ${comp.colorLight}, white)`
          : 'white',
      }}
    >
      {/* Glow effect */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-2xl opacity-30 blur-xl pointer-events-none"
          style={{ background: comp.color }}
        />
      )}

      <div className="relative z-10 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300"
          style={{
            background: isActive ? comp.color : comp.colorLight,
            border: `1px solid ${comp.colorBorder}`,
            boxShadow: isActive ? `0 4px 14px ${comp.color}44` : 'none',
          }}
        >
          <Icon className="h-4 w-4 transition-colors" style={{ color: isActive ? '#fff' : comp.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[var(--text-strong)] truncate">{comp.label}</p>
          <p className="text-[10px] text-[var(--text-faint)] truncate">{comp.description.slice(0, 52)}...</p>
        </div>
      </div>

      {/* Core visualization for CUDA & Tensor rows */}
      {isMiddle && (
        <div className="relative z-10 mt-3 rounded-lg p-2" style={{ background: comp.colorLight }}>
          <CoreGrid
            count={comp.id === 'cuda-cores' ? 32 : 8}
            color={comp.color}
            size={comp.id === 'cuda-cores' ? 5 : 8}
            gap={comp.id === 'cuda-cores' ? 2 : 4}
          />
          <p className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: comp.color }}>
            {comp.id === 'cuda-cores' ? 'FP32 / INT32 Units' : 'Matrix FMA Units'}
          </p>
        </div>
      )}
    </button>
  );
};

/* ━━━━━━━━━━━ Main Section ━━━━━━━━━━━ */
const SMDiagramSection = () => {
  const [activeId, setActiveId] = useState(null);
  const activeComp = SM_COMPONENTS.find(c => c.id === activeId) || null;

  const toggle = (id) => setActiveId(prev => prev === id ? null : id);

  return (
    <section id="section-sm" className="mb-14 scroll-mt-28">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1">
        <Cpu className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">
          Streaming Multiprocessor Architecture
        </h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">
        Interactive diagram of an SM's physical hardware — click any block to learn more
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── Diagram column (left 3 cols) ── */}
        <div className="lg:col-span-3 rounded-[22px] border border-[var(--border-soft)] bg-white p-5 gpu-grid-light">
          {/* Title bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 sm-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
              Streaming Multiprocessor (SM) — Physical Layout
            </span>
          </div>

          {/* Warp Scheduler — full width */}
          <SMBlock
            comp={SM_COMPONENTS[0]}
            isActive={activeId === SM_COMPONENTS[0].id}
            onClick={() => toggle(SM_COMPONENTS[0].id)}
          />
          <Connector color={SM_COMPONENTS[0].colorBorder} />

          {/* Register File — full width */}
          <SMBlock
            comp={SM_COMPONENTS[1]}
            isActive={activeId === SM_COMPONENTS[1].id}
            onClick={() => toggle(SM_COMPONENTS[1].id)}
          />
          <Connector color={SM_COMPONENTS[1].colorBorder} />

          {/* CUDA + Tensor side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <SMBlock
              comp={SM_COMPONENTS[2]}
              isActive={activeId === SM_COMPONENTS[2].id}
              onClick={() => toggle(SM_COMPONENTS[2].id)}
            />
            <SMBlock
              comp={SM_COMPONENTS[3]}
              isActive={activeId === SM_COMPONENTS[3].id}
              onClick={() => toggle(SM_COMPONENTS[3].id)}
            />
          </div>
          <Connector color={SM_COMPONENTS[4].colorBorder} />

          {/* L1 / Shared Memory — full width */}
          <SMBlock
            comp={SM_COMPONENTS[4]}
            isActive={activeId === SM_COMPONENTS[4].id}
            onClick={() => toggle(SM_COMPONENTS[4].id)}
          />

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border-soft)] pt-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-faint)]">Legend:</span>
            {SM_COMPONENTS.map(c => (
              <span key={c.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-muted)]">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />
                {c.shortLabel}
              </span>
            ))}
          </div>
        </div>

        {/* ── Detail panel column (right 2 cols) ── */}
        <div className="lg:col-span-2 flex flex-col">
          {activeComp ? (
            <DetailPanel comp={activeComp} onClose={() => setActiveId(null)} />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-[22px] border border-dashed border-[var(--border-soft)] bg-[rgba(249,251,254,0.5)] p-8">
              <div className="text-center">
                <Cpu className="mx-auto mb-3 h-8 w-8 text-[var(--border-soft)]" />
                <p className="text-[13px] font-semibold text-[var(--text-faint)]">
                  Select a component
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-faint)]">
                  Click any block in the diagram to see detailed information about that hardware unit.
                </p>
              </div>
            </div>
          )}

          {/* Quick reference card */}
          <div className="mt-4 rounded-[18px] border border-[var(--border-soft)] bg-white p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)] mb-3">
              Quick Reference
            </h4>
            <div className="space-y-2.5">
              {[
                { label: 'Warp Size', value: '32 threads' },
                { label: 'Typical CUDA Cores / SM', value: '64 — 128' },
                { label: 'Typical Tensor Cores / SM', value: '4 — 8' },
                { label: 'Shared Memory Pool', value: 'Up to 228 KB (Blackwell)' },
                { label: 'Register File', value: '64 K x 32-bit registers' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[var(--text-muted)]">{item.label}</span>
                  <span className="font-bold text-[var(--text-strong)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SMDiagramSection;
