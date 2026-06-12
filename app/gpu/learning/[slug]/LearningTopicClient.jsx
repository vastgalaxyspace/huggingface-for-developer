"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import PhysicalHardwareVisuals from "../../../../src/components/gpu/visuals/PhysicalHardwareVisuals";
import LearningTopicVisuals from "../../../../src/components/gpu/visuals/LearningTopicVisuals";
import { AppContext } from "../../../../src/components/providers/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../src/components/ui/card";
import { getTutorialFromFirestore } from "../../../../src/lib/tutorialsFirestore";
import { getTutorialProgress, saveTutorialProgress } from "../../../../src/lib/tutorialProgress";

const GPU_TUTORIAL_ID = "gpu";
const FINAL_TOPIC_SLUG = "libraries-frameworks";

const TABS = [
  { key: "learning", label: "Learning" },
  { key: "visuals", label: "Visuals" },
];

const TOPIC_THEME = {
  "h-sm": { header: "bg-[#e6f2ff]", badge: "bg-[#0f5ea8]" },
  "h-cuda": { header: "bg-[#eaf8ff]", badge: "bg-[#0a7298]" },
  "h-tens": { header: "bg-[#eef0ff]", badge: "bg-[#3149b8]" },
  "h-warp": { header: "bg-[#fff2e8]", badge: "bg-[#b45309]" },
  "h-sfu": { header: "bg-[#ecfbf8]", badge: "bg-[#0f766e]" },
  "h-tma": { header: "bg-[#f3f5ff]", badge: "bg-[#4c1d95]" },
  "h-reg": { header: "bg-[#edf9ef]", badge: "bg-[#166534]" },
  "h-shmem": { header: "bg-[#edf8ff]", badge: "bg-[#0369a1]" },
  "h-vram": { header: "bg-[#eaf2ff]", badge: "bg-[#1d4ed8]" },
};

const getLearningItems = (topic) => {
  if (Array.isArray(topic?.theory) && topic.theory.length > 0) {
    return topic.theory.map((item) => item.title);
  }

  return Array.isArray(topic?.learning) ? topic.learning : [];
};

const getVisualItems = (topic) => (Array.isArray(topic?.visuals) ? topic.visuals : []);

const getTrackItemKey = (topicSlug, tab, index) => `${topicSlug}:${tab}:${index}`;

const getAllTrackKeys = (topics = {}) =>
  Object.entries(topics).flatMap(([topicSlug, topicValue]) => [
    ...getLearningItems(topicValue).map((_, index) => getTrackItemKey(topicSlug, "learning", index)),
    ...getVisualItems(topicValue).map((_, index) => getTrackItemKey(topicSlug, "visuals", index)),
  ]);

export default function LearningTopicClient({ slug }) {
  const router = useRouter();
  const { auth } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("learning");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [tutorial, setTutorial] = useState(null);
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [progressError, setProgressError] = useState("");
  const [readItems, setReadItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTopic() {
      setIsLoading(true);
      setLoadError("");
      setSelectedTopicIndex(0);
      setActiveTab("learning");

      const remoteTutorial = await getTutorialFromFirestore(GPU_TUTORIAL_ID);
      if (!isMounted) return;

      const remoteTopic = remoteTutorial?.topics?.[slug];
      if (remoteTopic) {
        setTutorial(remoteTutorial);
        setTopic(remoteTopic);
      } else {
        setTutorial(remoteTutorial || null);
        setTopic(null);
        setLoadError("This GPU tutorial topic is not available in Firestore yet.");
      }

      setIsLoading(false);
    }

    fetchTopic();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (auth.loading || !auth.user) return;

    let isMounted = true;

    async function fetchProgress() {
      setProgressLoading(true);
      const savedProgress = await getTutorialProgress(auth.user.uid, GPU_TUTORIAL_ID);
      if (!isMounted) return;

      setReadItems(Array.isArray(savedProgress?.readItems) ? savedProgress.readItems : []);
      setProgressLoading(false);
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [auth.loading, auth.user]);

  const items = useMemo(() => topic?.[activeTab] || [], [topic, activeTab]);
  const theoryItems = useMemo(() => topic?.theory || [], [topic]);
  const isLearning = activeTab === "learning";
  const isPhysicalVisuals = slug === "physical-hardware" && activeTab === "visuals";
  const hasDedicatedVisuals = activeTab === "visuals" && slug !== "physical-hardware";
  const sidebarTopics = useMemo(
    () => (isLearning && theoryItems.length > 0 ? theoryItems.map((item) => item.title) : items),
    [isLearning, items, theoryItems]
  );

  const safeIndex = Math.min(selectedTopicIndex, Math.max(sidebarTopics.length - 1, 0));
  const selectedTheoryTopic = isLearning ? theoryItems[safeIndex] : null;
  const selectedListTopic = !selectedTheoryTopic ? items[safeIndex] : null;
  const allTrackKeys = useMemo(() => getAllTrackKeys(tutorial?.topics || {}), [tutorial]);
  const allTrackKeySet = useMemo(() => new Set(allTrackKeys), [allTrackKeys]);
  const validReadCount = useMemo(
    () => readItems.filter((itemKey) => allTrackKeySet.has(itemKey)).length,
    [allTrackKeySet, readItems]
  );
  const totalTrackItems = allTrackKeys.length;
  const progressPercent = totalTrackItems > 0 ? Math.round((validReadCount / totalTrackItems) * 100) : 0;
  const isFinalTopic = slug === FINAL_TOPIC_SLUG;

  const markTrackItemRead = useCallback((targetSlug, targetTab, targetIndex) => {
    if (!auth.user || targetIndex < 0) return;

    const itemKey = getTrackItemKey(targetSlug, targetTab, targetIndex);
    if (!allTrackKeySet.has(itemKey) || readItems.includes(itemKey)) return;

    const nextReadItems = [...readItems, itemKey];
    setReadItems(nextReadItems);
    setProgressError("");

    const nextValidReadCount = nextReadItems.filter((key) => allTrackKeySet.has(key)).length;

    saveTutorialProgress(auth.user.uid, GPU_TUTORIAL_ID, {
      tutorialId: GPU_TUTORIAL_ID,
      tutorialTitle: tutorial?.title || "GPU Tutorial for AI Developers",
      readItems: nextReadItems,
      totalItems: totalTrackItems,
      progressPercent: totalTrackItems > 0 ? Math.round((nextValidReadCount / totalTrackItems) * 100) : 0,
      lastTopicSlug: targetSlug,
      lastTab: targetTab,
      lastItemIndex: targetIndex,
      startedAt: readItems.length === 0 ? new Date().toISOString() : undefined,
    }).catch((err) => {
      console.error("Error saving GPU tutorial progress:", err);
      setProgressError("Progress could not be saved right now.");
    });
  }, [allTrackKeySet, auth.user, readItems, totalTrackItems, tutorial?.title]);

  useEffect(() => {
    if (progressLoading || sidebarTopics.length === 0) return;

    const timeout = window.setTimeout(() => {
      markTrackItemRead(slug, activeTab, safeIndex);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [activeTab, markTrackItemRead, progressLoading, safeIndex, sidebarTopics.length, slug]);

  if (auth.loading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[#f2f6fb] px-6 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4e6883]">GPU Learning Path</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#152a40]">Checking your account...</h1>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[#f2f6fb] px-6 text-center">
        <div className="max-w-md rounded-[22px] border border-[#d7e5f4] bg-white p-8 shadow-[0_12px_30px_rgba(31,45,61,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4e6883]">GPU Learning Path</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#152a40]">Sign in to start the GPU tutorial</h1>
          <p className="mt-3 text-sm leading-7 text-[#4e6883]">
            Your learning progress, final test result, and certificate are saved to your account.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/login?next=/gpu/learning/${slug}`)}
            className="mt-6 inline-flex rounded-xl bg-[#18324f] px-5 py-3 text-sm font-bold text-white hover:bg-[#11253b]"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || progressLoading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[#f2f6fb] px-6 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4e6883]">GPU Learning Path</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#152a40]">Loading GPU tutorial...</h1>
        </div>
      </div>
    );
  }

  if (loadError || !topic) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[#f2f6fb] px-6 text-center">
        <div className="max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4e6883]">GPU Learning Path</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#152a40]">GPU tutorial unavailable</h1>
          <p className="mt-3 text-sm leading-7 text-[#4e6883]">
            {loadError || "No GPU tutorial topic was found in Firestore."}
          </p>
          <Link
            href="/gpu"
            className="mt-6 inline-flex rounded-xl bg-[#18324f] px-5 py-3 text-sm font-bold text-white hover:bg-[#11253b]"
          >
            Back to GPU Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <Card className="rounded-[20px] border-[#cddaea] bg-gradient-to-b from-white via-[#fbfdff] to-[#f7fbff] p-6 md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#1f3f5f]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU Hub
          </Link>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#4e6883]">{topic.id} / Learning Path</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.02em] text-[#152a40] md:text-5xl">{topic.title}</h1>
          <p className="mt-3 max-w-[760px] text-base leading-8 text-[#2f4a64]">{topic.subtitle}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[250px_1fr]">
            <Card className="rounded border-[#d7e5f4] bg-[#f6fbff] p-3">
              <p className="mb-2 px-1 text-xs font-black uppercase tracking-[0.16em] text-[#4e6883]">
                Main Sections
              </p>
              <div className="mb-4 rounded border border-[#d7e5f4] bg-white p-3">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-[#4e6883]">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf5ff]">
                  <div
                    className="h-full rounded-full bg-[#18324f] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs font-semibold leading-5 text-[#4e6883]">
                  {validReadCount} of {totalTrackItems} learning + visual items visited
                </p>
                {progressError ? (
                  <p className="mt-2 text-xs font-semibold text-red-700">{progressError}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                {TABS.map((tab) => (
                  <div key={tab.key}>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab !== tab.key) {
                          setActiveTab(tab.key);
                          setSelectedTopicIndex(0);
                        }
                      }}
                      className={`w-full rounded text-left text-sm font-black uppercase tracking-[0.14em] ${
                        activeTab === tab.key
                          ? "border border-[#adc9e4] bg-[#edf5ff] px-3 py-3 text-[#183a5b]"
                          : "border border-transparent bg-[#f8fbff] px-3 py-3 text-[#34506c] hover:bg-white"
                      }`}
                    >
                      {tab.label}
                    </button>

                    {activeTab === tab.key ? (
                      <div className="mt-2 border-l-2 border-[#c8d7e7] pl-2">
                        <p className="mb-1 px-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4e6883]">
                          Sub Topics
                        </p>
                        <div className="space-y-1">
                          {sidebarTopics.map((item, index) => {
                            const itemKey = getTrackItemKey(slug, activeTab, index);
                            const isRead = readItems.includes(itemKey);

                            return (
                              <button
                                key={`${item}-${index}`}
                                type="button"
                                onClick={() => setSelectedTopicIndex(index)}
                                className={`flex w-full items-center justify-between gap-2 rounded text-left text-sm leading-6 font-semibold tracking-[0.01em] ${
                                  safeIndex === index
                                    ? "border border-[#bed3e8] bg-white px-2.5 py-2.5 text-[#163a5d]"
                                    : "border border-transparent px-2.5 py-2.5 text-[#34506c] hover:bg-white"
                                }`}
                              >
                                <span>{String(index + 1).padStart(2, "0")} - {item}</span>
                                {isRead ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-700" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-3">
              {selectedTheoryTopic ? (
                <PhysicalHardwareTopic topic={selectedTheoryTopic} />
              ) : isPhysicalVisuals ? (
                <PhysicalHardwareVisuals selectedIndex={safeIndex} />
              ) : hasDedicatedVisuals ? (
                <LearningTopicVisuals slug={slug} selectedIndex={safeIndex} />
              ) : selectedListTopic ? (
                <Card className="rounded border-[#d7e5f4] bg-[#f8fcff] px-4 py-3 text-base leading-8 text-[#2f4a64]">
                  <Sparkles className="mr-2 inline h-4 w-4 text-[#4e6883]" />
                  {selectedListTopic}
                </Card>
              ) : null}

              <SubTopicNavigator
                total={sidebarTopics.length}
                currentIndex={safeIndex}
                onSelect={setSelectedTopicIndex}
              />

              {isFinalTopic ? (
                <Card className="rounded-xl border-[#d7e5f4] bg-white p-5 md:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4e6883]">Final test</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#152a40]">GPU Tutorial MCQ</h2>
                  <p className="mt-3 text-sm leading-7 text-[#4e6883]">
                    The final test is now on a separate page with 10 MCQ questions. Your current progress is {progressPercent}%.
                  </p>
                  <Link
                    href="/gpu/test"
                    className="mt-5 inline-flex rounded-xl bg-[#18324f] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#11253b]"
                  >
                    Open final test
                  </Link>
                </Card>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PhysicalHardwareTopic({ topic }) {
  const theme = TOPIC_THEME[topic.toneClass] || TOPIC_THEME["h-sm"];

  return (
    <Card className="overflow-hidden rounded-xl border-[#d7e5f4] bg-white">
      <CardHeader className={`border-b border-[#d7e5f4] px-4 py-3 ${theme.header}`}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#39546f]">Topic {topic.id}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white ${theme.badge}`}>
            {topic.id}
          </span>
          <CardTitle className="text-xl leading-7 text-[#0f2944]">{topic.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4 md:px-5 md:py-5">
        {topic.blocks.map((block, blockIndex) => (
          <Card key={`${topic.id}-${blockIndex}`} className="rounded border-[#d7e5f4] bg-[#fbfdff] p-4 md:p-5">
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#34506c]">{block.title}</h4>
            <div className="mt-4 space-y-4">
              {block.sections.map((section, sectionIndex) => (
                <RenderSection key={`${topic.id}-${blockIndex}-${section.type}-${sectionIndex}`} section={section} />
              ))}
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function RenderSection({ section }) {
  if (section.type === "content") {
    return (
      <div className="space-y-3">
        {section.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-8 text-[#2f4a64]">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  if (section.type === "list") {
    return (
      <ul className="space-y-2.5">
        {section.items.map((item, index) => (
          <li key={index} className="rounded border border-[#dbe3ed] bg-white px-3.5 py-2.5 text-base leading-7 text-[#2f4a64]">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (section.type === "compare") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {section.columns.map((column, index) => (
          <div key={index} className="rounded border border-[#dbe3ed] bg-white p-3.5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#39546f]">{column.label}</p>
            <ul className="mt-2 space-y-1.5">
              {column.items.map((item, itemIndex) => (
                <li key={itemIndex} className="border-t border-[#e7edf4] pt-1.5 text-sm leading-7 text-[#2f4a64] first:border-t-0 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "formula") {
    return (
      <Card className="rounded border-[#d7e5f4] bg-[#f8fbff] px-3 py-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-[#213f5b]">{section.main}</pre>
        {section.sub ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#34506c]">{section.sub}</p>
        ) : null}
      </Card>
    );
  }

  if (section.type === "kv") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {section.items.map((kv, index) => (
          <div key={index} className="rounded border border-[#dbe3ed] bg-white px-3.5 py-3">
            <p className="text-xs font-semibold text-[#4e6883]">{kv.key}</p>
            <p className="mt-1 whitespace-pre-wrap font-mono text-sm leading-7 text-[#213f5b]">{kv.value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "tags") {
    return (
      <div className="flex flex-wrap gap-2">
        {section.items.map((tag, index) => (
          <span key={index} className="rounded border border-[#dbe3ed] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#34506c]">
            {tag}
          </span>
        ))}
      </div>
    );
  }

  if (section.type === "table") {
    return (
      <Card className="overflow-x-auto rounded border-[#d7e5f4] bg-white">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-[#f4f8fc]">
            <tr>
              {section.headers.map((header, index) => (
                <th key={index} className="whitespace-nowrap border-b border-[#dbe3ed] px-3 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#39546f]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[#edf2f7] last:border-b-0">
                {(Array.isArray(row) ? row : row.cells || []).map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-pre-wrap px-3 py-2.5 text-sm leading-7 text-[#2f4a64]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  return null;
}

function SubTopicNavigator({ total, currentIndex, onSelect }) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  return (
    <Card className="rounded border-[#d7e5f4] bg-[#f6fbff] p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => hasPrev && onSelect(currentIndex - 1)}
          className="inline-flex items-center justify-center gap-2 rounded border border-[#cfdcea] bg-white px-3 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-[#1f3f5f] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => hasNext && onSelect(currentIndex + 1)}
          className="inline-flex items-center justify-center gap-2 rounded border border-[#cfdcea] bg-white px-3 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-[#1f3f5f] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}
