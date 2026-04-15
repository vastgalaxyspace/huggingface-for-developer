'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import styles from './page.module.css';

const navItems = [
  { id: 'hero', label: 'Overview' },
  { id: 'models', label: 'Models' },
  { id: 'tools', label: 'Tools' },
  { id: 'automation', label: 'Automation' },
  { id: 'agentic', label: 'Agentic' },
  { id: 'languages', label: 'Languages' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'resources', label: 'Resources' },
];

const models = [
  {
    name: 'Claude 3.7 Sonnet',
    maker: 'Anthropic',
    bestUseCase: 'Large repo refactors and long reasoning chains',
    contextWindow: '200K',
    speed: 4,
    badge: 'Paid',
  },
  {
    name: 'GPT-4o',
    maker: 'OpenAI',
    bestUseCase: 'Balanced coding copilot with strong multimodal support',
    contextWindow: '128K',
    speed: 5,
    badge: 'Paid',
  },
  {
    name: 'Gemini 2.5 Pro',
    maker: 'Google',
    bestUseCase: 'Very long context engineering analysis',
    contextWindow: '1,048K',
    speed: 3,
    badge: 'Free + Paid',
  },
  {
    name: 'DeepSeek-Coder V2',
    maker: 'DeepSeek',
    bestUseCase: 'Strong open coding model for generation and editing',
    contextWindow: '128K',
    speed: 4,
    badge: 'Free/Open',
  },
  {
    name: 'Mistral Codestral',
    maker: 'Mistral AI',
    bestUseCase: 'Code completion and FIM-heavy workflows',
    contextWindow: '128K',
    speed: 4,
    badge: 'Paid',
  },
  {
    name: 'Llama 3',
    maker: 'Meta',
    bestUseCase: 'Self-hosted coding assistants and customization',
    contextWindow: '8K',
    speed: 4,
    badge: 'Free/Open',
  },
];

const toolGroups = [
  {
    title: 'AI Editors',
    tools: [
      { name: 'Cursor', desc: 'Agent-first editor with project-aware code generation.', url: 'https://cursor.com' },
      { name: 'Windsurf', desc: 'Codeium editor for full-stack app building and edits.', url: 'https://windsurf.com' },
      { name: 'Replit AI', desc: 'In-browser coding with AI assistant and deploy flow.', url: 'https://replit.com' },
    ],
  },
  {
    title: 'IDE Plugins',
    tools: [
      { name: 'GitHub Copilot', desc: 'Inline completions and chat inside popular IDEs.', url: 'https://github.com/features/copilot' },
      { name: 'Codeium', desc: 'Fast code completion and chat plugin suite.', url: 'https://codeium.com' },
      { name: 'Tabnine', desc: 'Private and enterprise-oriented code assistant.', url: 'https://www.tabnine.com' },
      { name: 'JetBrains AI', desc: 'Native AI features integrated with JetBrains IDEs.', url: 'https://www.jetbrains.com/ai' },
      { name: 'Supermaven', desc: 'Low-latency, long-context coding autocomplete.', url: 'https://supermaven.com' },
    ],
  },
  {
    title: 'Terminal/Agents',
    tools: [
      { name: 'Claude Code', desc: 'Terminal-native coding agent for repo-level tasks.', url: 'https://www.anthropic.com/claude-code' },
      { name: 'Devin', desc: 'Autonomous software engineer style agent workflow.', url: 'https://devin.ai' },
      { name: 'OpenHands', desc: 'Open-source coding agent framework for real tasks.', url: 'https://www.all-hands.dev' },
    ],
  },
];

const automationCards = [
  {
    icon: '🧪',
    title: 'Auto Test Generation',
    desc: 'Generate unit tests and edge cases from existing source files and functions.',
    snippet: 'Prompt: "Write Jest tests for auth middleware"\nResult: 24 tests including token expiry and malformed headers.',
  },
  {
    icon: '🔎',
    title: 'AI Code Review',
    desc: 'Flag anti-patterns, missed validations, and style issues before merge.',
    snippet: 'PR bot summary:\n- Missing null-check in payment flow\n- O(n^2) loop in ranking function',
  },
  {
    icon: '📚',
    title: 'Documentation Generation',
    desc: 'Build API docs, setup guides, and changelog notes from code diffs.',
    snippet: 'Generated README section:\n"POST /invoices now supports batch mode and idempotency keys."',
  },
  {
    icon: '🐞',
    title: 'Bug Detection',
    desc: 'Scan stack traces and code paths to suggest likely failure points.',
    snippet: 'Trace matched issue:\nRace condition in cache invalidation after async write.',
  },
  {
    icon: '🚀',
    title: 'CI/CD Automation',
    desc: 'Create release notes, pipeline checks, and deployment guardrails.',
    snippet: 'CI workflow update:\nAdded smoke tests + rollback trigger for 5xx spike > 2%.',
  },
  {
    icon: '🛠️',
    title: 'Auto Refactoring',
    desc: 'Convert duplicated logic into shared modules and safer abstractions.',
    snippet: 'Refactor agent output:\nExtracted 6 duplicate validators into /lib/validation.ts.',
  },
];

const flowSteps = [
  { title: 'Plan', desc: 'Break down task goals, files, and acceptance criteria.' },
  { title: 'Write', desc: 'Generate initial code changes across relevant files.' },
  { title: 'Run', desc: 'Execute code and commands to validate behavior quickly.' },
  { title: 'Test', desc: 'Run unit/integration tests and collect failing cases.' },
  { title: 'Fix', desc: 'Patch errors, adjust logic, and tighten edge-case handling.' },
  { title: 'Deploy', desc: 'Ship through gated CI/CD with human checkpoints.' },
];

const languageStrengths = [
  { name: 'Python', score: 96 },
  { name: 'JavaScript', score: 93 },
  { name: 'TypeScript', score: 91 },
  { name: 'Java', score: 86 },
  { name: 'Go', score: 84 },
  { name: 'Rust', score: 74 },
  { name: 'C++', score: 68 },
  { name: 'SQL', score: 88 },
];

const promptExamples = [
  {
    title: 'Refactor a Function',
    weak: 'Refactor this function.',
    strong:
      'Refactor this Node.js function for readability.\nKeep behavior identical.\nAdd unit tests in Jest.\nReturn patch only.',
    outputWeak: '// vague output\nfunction f(a,b){...}',
    outputStrong:
      '// structured output\n- clear naming\n- extracted helpers\n- 5 Jest tests for edge cases',
  },
  {
    title: 'Fix a Production Bug',
    weak: 'Fix the bug in checkout.',
    strong:
      'Fix race condition in checkout service.\nUse optimistic lock.\nAdd regression test.\nExplain root cause in 4 bullets.',
    outputWeak: 'Likely null pointer. Try adding checks.',
    outputStrong:
      'Root cause: concurrent writes on cart state.\nPatch: versioned update + retry.\nRegression test: parallel checkout simulation.',
  },
  {
    title: 'Write SQL Safely',
    weak: 'Give SQL for user search.',
    strong:
      'PostgreSQL query for user search by email.\nUse parameterized query.\nAdd index recommendation and EXPLAIN notes.',
    outputWeak: 'SELECT * FROM users WHERE email = "...";',
    outputStrong:
      'SELECT id,email FROM users WHERE email = $1;\nIndex: CREATE INDEX idx_users_email ON users(email);',
  },
  {
    title: 'Generate API Endpoint',
    weak: 'Create an API endpoint.',
    strong:
      'Create Next.js route handler for POST /api/tickets.\nValidate payload with zod.\nReturn typed errors.\nAdd curl example.',
    outputWeak: 'Basic route with no validation.',
    outputStrong:
      'Includes schema validation, error map, and sample request/response contract.',
  },
];

const benchmarkData = {
  labels: ['GPT-4o', 'DeepSeek-Coder-V2', 'Claude 3 Opus', 'Gemini 1.5 Pro', 'Codestral'],
  humaneval: [91.0, 90.2, 84.2, 83.5, 78.1],
  swebench: [26.7, 12.7, 11.7, 19.3, 2.7],
};

const resourceColumns = [
  {
    title: 'Learning Resources',
    items: [
      { label: 'Anthropic Claude Docs', href: 'https://docs.anthropic.com' },
      { label: 'OpenAI API Docs', href: 'https://platform.openai.com/docs' },
      { label: 'Google AI (Gemini) Docs', href: 'https://ai.google.dev/gemini-api/docs' },
      { label: 'Mistral Docs', href: 'https://docs.mistral.ai' },
      { label: 'DeepSeek-Coder-V2 Repository', href: 'https://github.com/deepseek-ai/DeepSeek-Coder-V2' },
    ],
  },
  {
    title: 'Communities',
    items: [
      { label: 'Hugging Face Open LLM Community', href: 'https://huggingface.co/community' },
      { label: 'r/LocalLLaMA', href: 'https://www.reddit.com/r/LocalLLaMA/' },
      { label: 'OpenHands Discord', href: 'https://discord.gg/ESHStjSjD4' },
      { label: 'Mistral Community', href: 'https://community.mistral.ai' },
      { label: 'LangChain Forum', href: 'https://forum.langchain.com' },
    ],
  },
  {
    title: 'Upcoming Trends',
    items: [
      { label: 'Voice coding workflows with structured agents' },
      { label: 'Self-healing code pipelines with auto rollback' },
      { label: 'AI pair programming as default team workflow' },
      { label: 'Policy-aware coding agents for enterprise compliance' },
      { label: 'Hybrid local + cloud coding model routing' },
    ],
  },
];

function StarRating({ value }) {
  const stars = '★★★★★'.slice(0, value) + '☆☆☆☆☆'.slice(0, 5 - value);
  return <span className={styles.stars}>{stars}</span>;
}

export default function CodingModelAnalysisPage() {
  const [counter, setCounter] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const counterStarted = useRef(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const benchmarkSummary = useMemo(
    () =>
      `HumanEval and SWE-bench values are from DeepSeek-Coder-V2 public evaluation tables (2024), retained for cross-model apples-to-apples reference in 2025 planning.`,
    [],
  );

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
            if (entry.target.id === 'hero' && !counterStarted.current) {
              counterStarted.current = true;
              const start = performance.now();
              const duration = 1300;
              const animate = (ts) => {
                const progress = Math.min((ts - start) / duration, 1);
                setCounter(Math.round(progress * 40));
                if (progress < 1) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
            }

            if (entry.target.id === 'languages') {
              document.querySelectorAll('[data-lang-score]').forEach((el) => {
                const score = Number(el.getAttribute('data-lang-score'));
                el.style.width = `${score}%`;
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: benchmarkData.labels,
        datasets: [
          {
            label: 'HumanEval (%)',
            data: benchmarkData.humaneval,
            backgroundColor: 'rgba(124, 58, 237, 0.82)',
            borderColor: 'rgba(124, 58, 237, 1)',
            borderWidth: 1,
          },
          {
            label: 'SWE-bench (%)',
            data: benchmarkData.swebench,
            backgroundColor: 'rgba(59, 130, 246, 0.82)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: { color: '#b9c7f8' },
            grid: { color: 'rgba(123, 148, 255, 0.12)' },
          },
          y: {
            ticks: { color: '#dbe5ff' },
            grid: { color: 'rgba(123, 148, 255, 0.08)' },
          },
        },
        plugins: {
          legend: {
            labels: { color: '#dbe5ff' },
          },
          tooltip: {
            backgroundColor: '#0f1530',
            borderColor: 'rgba(123, 148, 255, 0.4)',
            borderWidth: 1,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>AI Coding Analysis 2025</div>
          <button className={styles.menuBtn} onClick={() => setNavOpen((v) => !v)} aria-label="Toggle menu">
            Menu
          </button>
          <nav className={`${styles.navLinks} ${navOpen ? styles.navOpen : ''}`}>
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={() => setNavOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        <section id="hero" className={`${styles.hero} ${styles.reveal}`} data-reveal>
          <div className={styles.heroBadge}>AI Coding Report</div>
          <h1>AI is Writing Code — Are You Using It?</h1>
          <p className={styles.heroText}>
            Modern coding teams now combine human architecture thinking with model-assisted implementation, review, and
            automation. This page gives a practical snapshot of models, tools, and workflows that matter most in 2025.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.counter}>{counter}%</div>
              <div className={styles.counterLabel}>of code is now AI-assisted</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.counter}>9</div>
              <div className={styles.counterLabel}>core sections for real-world implementation</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.counter}>2025</div>
              <div className={styles.counterLabel}>data-focused snapshot</div>
            </div>
          </div>
        </section>

        <section id="models" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>AI Coding Models</h2>
            <p>
              Side-by-side coding model cards for popular choices used in product teams. Context windows and access tiers
              are shown for practical selection.
            </p>
          </div>
          <div className={styles.modelsGrid}>
            {models.map((model) => (
              <article key={model.name} className={styles.card}>
                <div className={styles.chipRow}>
                  <div />
                  <span className={`${styles.badge} ${model.badge.includes('Free') ? styles.badgeFree : styles.badgePaid}`}>
                    {model.badge}
                  </span>
                </div>
                <div className={styles.modelName}>{model.name}</div>
                <div className={styles.maker}>{model.maker}</div>
                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    <span>Best Use Case</span>
                    <strong>{model.bestUseCase}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Context</span>
                    <strong>{model.contextWindow}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Speed</span>
                    <StarRating value={model.speed} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tools" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>AI Coding Tools</h2>
            <p>Grouped by where developers spend their time: editor, IDE, and terminal/agent workflows.</p>
          </div>
          <div className={styles.toolsGrid}>
            {toolGroups.map((group) => (
              <div className={styles.toolGroup} key={group.title}>
                <h3>{group.title}</h3>
                <div className={styles.toolCards}>
                  {group.tools.map((tool) => (
                    <article key={tool.name} className={styles.toolCard}>
                      <div className={styles.toolTop}>
                        <span className={styles.logoPh}>LOGO</span>
                        <div className={styles.toolName}>{tool.name}</div>
                      </div>
                      <p className={styles.toolDesc}>{tool.desc}</p>
                      <a className={styles.visitBtn} href={tool.url} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="automation" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>Automation with AI</h2>
            <p>Six high-impact automation patterns teams are deploying in day-to-day software delivery.</p>
          </div>
          <div className={styles.automationGrid}>
            {automationCards.map((card) => (
              <article key={card.title} className={styles.automationCard}>
                <div className={styles.automationIcon}>{card.icon}</div>
                <h3 className={styles.automationTitle}>{card.title}</h3>
                <p className={styles.automationDesc}>{card.desc}</p>
                <pre className={styles.snippet}>{card.snippet}</pre>
              </article>
            ))}
          </div>
        </section>

        <section id="agentic" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>Agentic Coding</h2>
            <p>Agents combine planning, coding, tool use, and iteration into an autonomous but monitorable workflow.</p>
          </div>
          <div className={styles.agentGrid}>
            <article className={styles.agentExplain}>
              Coding agents are systems that execute multi-step software tasks with tools: they read repository context,
              propose changes, run checks, and revise outputs. In production, effective usage adds guardrails such as
              constrained file scope, test gates, and human approval before deploy.
            </article>
            <article className={styles.flow}>
              <div className={styles.flowList}>
                {flowSteps.map((step, idx) => (
                  <div className={styles.flowStep} key={step.title}>
                    <span className={styles.flowNum}>{idx + 1}</span>
                    <div>
                      <div className={styles.flowTitle}>{step.title}</div>
                      <p className={styles.flowDesc}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="languages" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>Language Support Strength</h2>
            <p>Relative coding assistance quality in 2025 based on common benchmark and practitioner patterns.</p>
          </div>
          <div className={styles.langGrid}>
            {languageStrengths.map((lang) => (
              <article className={styles.langCard} key={lang.name}>
                <div className={styles.langTop}>
                  <strong>{lang.name}</strong>
                  <span>{lang.score}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} data-lang-score={lang.score} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="prompts" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>Prompt Engineering for Developers</h2>
            <p>Before/after prompt examples showing why specificity, constraints, and output contracts improve code quality.</p>
          </div>
          <div className={styles.promptGrid}>
            {promptExamples.map((example) => (
              <article className={styles.promptCard} key={example.title}>
                <h3>{example.title}</h3>
                <div className={styles.promptSplit}>
                  <div className={styles.codePane}>
                    <div className={styles.codeLabel}>Weak Prompt</div>
                    <pre className={styles.code}>
                      <code>
                        <span className={styles.com}># vague</span>{'\n'}
                        <span className={styles.kw}>prompt</span>: <span className={styles.str}>"{example.weak}"</span>
                      </code>
                    </pre>
                  </div>
                  <div className={styles.codePane}>
                    <div className={styles.codeLabel}>Strong Prompt</div>
                    <pre className={styles.code}>
                      <code>
                        <span className={styles.com}># explicit constraints</span>{'\n'}
                        <span className={styles.kw}>prompt</span>: <span className={styles.str}>"{example.strong}"</span>
                      </code>
                    </pre>
                  </div>
                  <div className={styles.codePane}>
                    <div className={styles.codeLabel}>Output Difference</div>
                    <pre className={styles.code}>
                      <code>
                        <span className={styles.kw}>weak_output</span>: <span className={styles.val}>{example.outputWeak}</span>{'\n'}
                        <span className={styles.kw}>strong_output</span>: <span className={styles.val}>{example.outputStrong}</span>
                      </code>
                    </pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="benchmarks" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>Benchmarks and Performance</h2>
            <p>HumanEval and SWE-bench comparison for five publicly reported coding models.</p>
          </div>
          <div className={styles.chartWrap}>
            <div style={{ height: '380px' }}>
              <canvas ref={chartRef} />
            </div>
            <p className={styles.chartFoot}>{benchmarkSummary}</p>
          </div>
        </section>

        <section id="resources" className={`${styles.section} ${styles.reveal}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2>Resources and Trends</h2>
            <p>Where to keep learning, collaborate, and track what is coming next in AI-assisted software engineering.</p>
          </div>
          <div className={styles.resourceGrid}>
            {resourceColumns.map((column) => (
              <article className={styles.resourceCol} key={column.title}>
                <h3>{column.title}</h3>
                <div className={styles.resourceList}>
                  {column.items.map((item) =>
                    item.href ? (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label}
                      </a>
                    ) : (
                      <span key={item.label}>{item.label}</span>
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
