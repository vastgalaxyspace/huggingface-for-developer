"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { AppContext } from "../providers/AppContext";
import { getTutorialFromFirestore } from "../../lib/tutorialsFirestore";
import { getTutorialProgress, saveTutorialProgress } from "../../lib/tutorialProgress";

const PASSING_SCORE = 70;

const AI_INFERENCE_QUIZ = [
  {
    id: "batching-throughput",
    question: "Which technique groups multiple inference requests to improve GPU throughput?",
    options: ["Batching", "DNS caching", "Image resizing", "Password hashing"],
    answerIndex: 0,
  },
  {
    id: "prefill-decode",
    question: "In LLM inference, what are the two major runtime phases?",
    options: ["Prefill and decode", "Compile and publish", "Upload and index", "Train and label"],
    answerIndex: 0,
  },
  {
    id: "kv-cache",
    question: "What does the KV cache help avoid during autoregressive generation?",
    options: ["Recomputing previous attention keys and values", "Loading CSS", "Creating user accounts", "Changing model licenses"],
    answerIndex: 0,
  },
  {
    id: "vram-limit",
    question: "What is usually the main capacity constraint when serving larger open-weight models on one GPU?",
    options: ["VRAM", "Monitor refresh rate", "Keyboard speed", "Browser storage"],
    answerIndex: 0,
  },
  {
    id: "quantization",
    question: "Why is quantization useful for inference?",
    options: ["It can reduce model memory use and bandwidth pressure", "It increases parameter count", "It disables batching", "It removes the need for prompts"],
    answerIndex: 0,
  },
  {
    id: "autoscaling",
    question: "What should production autoscaling consider for model-serving replicas?",
    options: ["Concurrency, cold starts, and queueing", "Only logo size", "Only the user's browser", "Only CSS bundle size"],
    answerIndex: 0,
  },
  {
    id: "health-checks",
    question: "Why do inference services need health checks?",
    options: ["To stop routing traffic to unhealthy replicas", "To improve spelling", "To increase monitor brightness", "To replace authentication"],
    answerIndex: 0,
  },
  {
    id: "latency",
    question: "Which metric is most directly about how long a user waits for an inference response?",
    options: ["Latency", "Disk color", "Repo stars", "Image width"],
    answerIndex: 0,
  },
  {
    id: "throughput",
    question: "Which metric describes how many requests or tokens a system can process over time?",
    options: ["Throughput", "Font weight", "Screen size", "Commit count"],
    answerIndex: 0,
  },
  {
    id: "fallbacks",
    question: "Why might a production AI app use fallback models?",
    options: ["To degrade gracefully during failures or overload", "To avoid logging forever", "To remove all security checks", "To make GPUs unnecessary"],
    answerIndex: 0,
  },
];

const GPU_QUIZ = [
  {
    id: "vram-global",
    question: "Which memory tier usually stores model weights and activations for large AI workloads?",
    options: ["VRAM / global memory", "Browser cookies", "CPU instruction cache", "Monitor framebuffer"],
    answerIndex: 0,
  },
  {
    id: "warp-size",
    question: "What is the standard NVIDIA CUDA warp size?",
    options: ["32 threads", "4 threads", "128 GPUs", "1 block"],
    answerIndex: 0,
  },
  {
    id: "tensor-cores",
    question: "Tensor cores are primarily optimized for which kind of work?",
    options: ["Matrix math used by AI models", "HTML layout", "File compression", "Network routing"],
    answerIndex: 0,
  },
  {
    id: "shared-memory",
    question: "Shared memory is best described as what?",
    options: ["Fast programmer-managed memory near each SM", "A cloud database", "A browser API", "A CPU-only disk cache"],
    answerIndex: 0,
  },
  {
    id: "coalescing",
    question: "Why does memory coalescing matter?",
    options: ["It helps nearby thread accesses use fewer memory transactions", "It changes the GPU name", "It removes all branches", "It increases monitor resolution"],
    answerIndex: 0,
  },
  {
    id: "divergence",
    question: "What happens when threads in a warp take different branch paths?",
    options: ["Warp divergence can serialize execution paths", "The GPU doubles VRAM", "The model becomes smaller", "The driver uninstalls"],
    answerIndex: 0,
  },
  {
    id: "occupancy",
    question: "Why can higher useful occupancy help kernel performance?",
    options: ["It can keep enough warps available to hide latency", "It changes CUDA source into JavaScript", "It deletes registers", "It removes profiling"],
    answerIndex: 0,
  },
  {
    id: "ptx-sass",
    question: "What is the relationship between PTX and SASS?",
    options: ["PTX is virtual ISA; SASS is architecture-specific machine code", "Both are image formats", "SASS is a CSS framework", "PTX is a database"],
    answerIndex: 0,
  },
  {
    id: "cublas",
    question: "Which NVIDIA library is commonly used for optimized GEMM operations?",
    options: ["cuBLAS", "Firebase Auth", "Next Image", "Firestore Rules"],
    answerIndex: 0,
  },
  {
    id: "profiling",
    question: "Why use tools like Nsight when optimizing GPU workloads?",
    options: ["To inspect bottlenecks, timelines, and kernel behavior", "To write privacy policies", "To create DNS records", "To replace model evaluation"],
    answerIndex: 0,
  },
];

const countAiSections = (chapters = []) =>
  chapters.reduce((total, chapter) => total + (chapter.sections || []).length, 0);

const getLearningItems = (topic) => {
  if (Array.isArray(topic?.theory) && topic.theory.length > 0) return topic.theory;
  return Array.isArray(topic?.learning) ? topic.learning : [];
};

const countGpuItems = (topics = {}) =>
  Object.values(topics).reduce(
    (total, topic) => total + getLearningItems(topic).length + (topic.visuals || []).length,
    0
  );

const buildCertificateId = (userId, tutorialId) =>
  `${tutorialId}-${userId?.slice(0, 6) || "user"}-${Date.now().toString(36)}`.toUpperCase();

const formatCertificateDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getLogoDataUrl = async () => {
  try {
    const response = await fetch("/images/innoai logo main.png");
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
};

const loadImageFromDataUrl = (dataUrl) =>
  new Promise((resolve) => {
    if (!dataUrl) {
      resolve(null);
      return;
    }

    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });

const drawFittedCanvasText = (ctx, text, x, y, maxWidth, fontSize, fontWeight, color, minSize = 18) => {
  let size = fontSize;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${size}px Arial, Helvetica, sans-serif`;

  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${fontWeight} ${size}px Arial, Helvetica, sans-serif`;
  }

  ctx.fillText(text, x, y);
};

const drawCertificateCanvas = async (certificate) => {
  const width = 1600;
  const height = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const logo = await loadImageFromDataUrl(await getLogoDataUrl());

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.55, "#f7fbff");
  gradient.addColorStop(1, "#eef6ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(58, 58, width - 116, height - 116);

  ctx.strokeStyle = "#18324f";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.roundRect(24, 24, width - 48, height - 48, 18);
  ctx.stroke();

  ctx.strokeStyle = "#9fb7d4";
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 58, width - 116, height - 116);
  ctx.strokeStyle = "#d7e5f4";
  ctx.strokeRect(88, 88, width - 176, height - 176);

  ctx.strokeStyle = "#c9d9eb";
  ctx.beginPath();
  ctx.moveTo(112, 226);
  ctx.lineTo(1488, 226);
  ctx.moveTo(112, 840);
  ctx.lineTo(1488, 840);
  ctx.stroke();

  if (logo) {
    ctx.drawImage(logo, 94, 82, 86, 68);
  } else {
    ctx.strokeStyle = "#0095ff";
    ctx.lineWidth = 4;
    ctx.strokeRect(104, 92, 48, 48);
    ctx.fillStyle = "#0095ff";
    ctx.font = "900 18px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("IA", 128, 124);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#10243d";
  ctx.font = "900 38px Arial, Helvetica, sans-serif";
  ctx.fillText("InnoAI", 210, 112);
  ctx.fillStyle = "#365784";
  ctx.font = "900 16px Arial, Helvetica, sans-serif";
  ctx.fillText("A I   E X P L O R E R", 212, 151);

  ctx.strokeStyle = "#c7d8ec";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(1010, 76, 478, 96, 48);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#6b8098";
  ctx.font = "900 16px Arial, Helvetica, sans-serif";
  ctx.fillText("CERTIFICATE ID", 1249, 112);
  drawFittedCanvasText(ctx, certificate.id, 1249, 146, 390, 19, 900, "#18324f", 12);

  ctx.strokeStyle = "#18324f";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(800, 318, 31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(800, 318, 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#365784";
  ctx.font = "900 23px Arial, Helvetica, sans-serif";
  ctx.fillText("C E R T I F I C A T E   O F   C O M P L E T I O N", 800, 405);
  drawFittedCanvasText(ctx, certificate.userName, 800, 527, 1000, 76, 900, "#10243d", 42);

  ctx.fillStyle = "#405b78";
  ctx.font = "400 28px Arial, Helvetica, sans-serif";
  ctx.fillText("is hereby awarded this certificate for successfully completing", 800, 632);
  drawFittedCanvasText(ctx, certificate.tutorialTitle, 800, 710, 1080, 50, 900, "#18324f", 30);
  ctx.font = "400 24px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "#405b78";
  ctx.fillText("with a final assessment score of", 744, 795);
  ctx.font = "900 26px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "#10243d";
  ctx.fillText(`${certificate.scorePercent}%.`, 818, 795);

  ctx.strokeStyle = "#7f9fbd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(118, 904);
  ctx.lineTo(465, 904);
  ctx.moveTo(1135, 904);
  ctx.lineTo(1482, 904);
  ctx.stroke();

  ctx.fillStyle = "#365784";
  ctx.font = "900 18px Arial, Helvetica, sans-serif";
  ctx.fillText("I S S U E D   D A T E", 292, 945);
  ctx.fillText("A U T H O R I Z E D   B Y", 1308, 945);
  ctx.fillStyle = "#10243d";
  ctx.font = "900 23px Arial, Helvetica, sans-serif";
  ctx.fillText(formatCertificateDate(certificate.issuedAt), 292, 985);
  ctx.fillText("InnoAI AI Explorer", 1308, 985);

  ctx.strokeStyle = "#18324f";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(800, 930, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#18324f";
  ctx.font = "900 40px Arial, Helvetica, sans-serif";
  ctx.fillText("IA", 800, 946);

  return canvas;
};

const dataUrlToBytes = (dataUrl) => {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const asciiBytes = (value) => new TextEncoder().encode(value);

const buildPdfWithJpeg = (jpegBytes) => {
  const pageWidth = 842;
  const pageHeight = 595;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /CertImage 4 0 R >> >> /Contents 5 0 R >>`,
    {
      dict: `<< /Type /XObject /Subtype /Image /Width 1600 /Height 1080 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>`,
      stream: jpegBytes,
    },
    {
      dict: "<< /Length 38 >>",
      stream: asciiBytes(`q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/CertImage Do\nQ\n`),
    },
  ];

  const chunks = [asciiBytes("%PDF-1.4\n")];
  const offsets = [0];
  let offset = chunks[0].length;

  objects.forEach((object, index) => {
    offsets.push(offset);
    const header = asciiBytes(`${index + 1} 0 obj\n`);
    chunks.push(header);
    offset += header.length;

    if (typeof object === "string") {
      const body = asciiBytes(`${object}\nendobj\n`);
      chunks.push(body);
      offset += body.length;
    } else {
      const dict = asciiBytes(`${object.dict}\nstream\n`);
      const end = asciiBytes("\nendstream\nendobj\n");
      chunks.push(dict, object.stream, end);
      offset += dict.length + object.stream.length + end.length;
    }
  });

  const xrefOffset = offset;
  const xrefRows = offsets
    .map((rowOffset, index) => (index === 0 ? "0000000000 65535 f " : `${String(rowOffset).padStart(10, "0")} 00000 n `))
    .join("\n");
  const trailer = asciiBytes(
    `xref\n0 ${objects.length + 1}\n${xrefRows}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );
  chunks.push(trailer);

  return new Blob(chunks, { type: "application/pdf" });
};

const downloadCertificate = async (certificate) => {
  const canvas = await drawCertificateCanvas(certificate);
  const jpegBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.95));
  const pdfBlob = buildPdfWithJpeg(jpegBytes);

  const fileName = `${certificate.tutorialId || "tutorial"}-certificate-${certificate.userName || "learner"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function TutorialTestClient({ tutorialId }) {
  const router = useRouter();
  const { auth } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const [tutorial, setTutorial] = useState(null);
  const [progress, setProgress] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [certificate, setCertificate] = useState(null);

  const isGpu = tutorialId === "gpu";
  const quiz = isGpu ? GPU_QUIZ : AI_INFERENCE_QUIZ;
  const title = isGpu ? "GPU Tutorial Final Test" : "AI Inference Tutorial Final Test";
  const tutorialTitle = isGpu ? "GPU Tutorial for AI Developers" : tutorial?.title || "AI Inference Tutorial";
  const backHref = isGpu ? "/gpu/learning/libraries-frameworks" : "/ai-inference/tutorial";
  const loginNext = isGpu ? "/gpu/test" : "/ai-inference/tutorial/test";

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.user) return;

    let isMounted = true;

    async function loadTestState() {
      setIsLoading(true);
      const [remoteTutorial, savedProgress] = await Promise.all([
        getTutorialFromFirestore(tutorialId),
        getTutorialProgress(auth.user.uid, tutorialId),
      ]);

      if (!isMounted) return;

      setTutorial(remoteTutorial);
      setProgress(savedProgress || null);
      setQuizResult(savedProgress?.quizResult || null);
      setCertificate(savedProgress?.certificate || null);
      setIsLoading(false);
    }

    loadTestState();

    return () => {
      isMounted = false;
    };
  }, [auth.loading, auth.user, tutorialId]);

  const completion = useMemo(() => {
    if (isGpu) {
      const total = countGpuItems(tutorial?.topics || {});
      const read = Array.isArray(progress?.readItems) ? progress.readItems.length : 0;
      return {
        read,
        total,
        complete: total > 0 && read >= total,
        label: `${read} of ${total} learning + visual items visited`,
      };
    }

    const total = countAiSections(tutorial?.chapters || []);
    const read = Array.isArray(progress?.readSections) ? progress.readSections.length : 0;
    return {
      read,
      total,
      complete: total > 0 && read >= total,
      label: `${read} of ${total} sections read`,
    };
  }, [isGpu, progress, tutorial]);

  const progressPercent = completion.total > 0 ? Math.round((completion.read / completion.total) * 100) : 0;
  const allAnswered = quiz.every((question) => Number.isInteger(answers[question.id]));

  const handleSubmit = async () => {
    const score = quiz.reduce(
      (total, question) => total + (answers[question.id] === question.answerIndex ? 1 : 0),
      0
    );
    const scorePercent = Math.round((score / quiz.length) * 100);
    const passed = scorePercent >= PASSING_SCORE;
    const nextResult = {
      score,
      total: quiz.length,
      scorePercent,
      passed,
      submittedAt: new Date().toISOString(),
    };
    const nextCertificate =
      passed
        ? certificate || {
            id: buildCertificateId(auth.user?.uid, tutorialId),
            tutorialId,
            tutorialTitle,
            userName: auth.profile?.displayName || auth.user?.email || "InnoAI learner",
            issuedAt: new Date().toISOString(),
            scorePercent,
          }
        : certificate;

    setQuizResult(nextResult);
    if (nextCertificate) setCertificate(nextCertificate);

    try {
      await saveTutorialProgress(auth.user.uid, tutorialId, {
        quizResult: nextResult,
        certificate: nextCertificate || null,
        completedAt: passed ? new Date().toISOString() : null,
      });
      setProgressError("");
    } catch (err) {
      console.error("Error saving tutorial test result:", err);
      setProgressError("Test result could not be saved right now.");
    }
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">{title}</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Checking your account...</h1>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div className="max-w-md rounded-[24px] border border-[var(--border-soft)] bg-white p-8 shadow-sm">
          <p className="section-kicker mb-3">{title}</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Sign in to take the test</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Your result and certificate are saved to your account.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/login?next=${loginNext}`)}
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">{title}</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Loading test...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="print-certificate-page min-h-[calc(100vh-78px)] bg-[var(--page-bg)] px-4 py-10">
      <main className="shell-container">
        <Link href={backHref} className="no-print inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
          <ArrowLeft className="h-4 w-4" />
          Back to tutorial
        </Link>

        <section className="no-print mt-5 rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
          <p className="section-kicker">{tutorialTitle}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Answer all {quiz.length} MCQs. Passing score: {PASSING_SCORE}%.
          </p>

          <div className="mt-6 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              <span>Completion</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--text-muted)]">{completion.label}</p>
          </div>

          {!completion.complete ? (
            <div className="mt-6 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-5 text-sm font-semibold text-[var(--text-muted)]">
              Finish the tutorial first. The MCQ unlocks when completion reaches 100%.
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-5">
                {quiz.map((question, questionIndex) => (
                  <fieldset key={question.id} className="rounded-xl border border-[var(--border-soft)] p-4">
                    <legend className="px-1 text-sm font-black text-[var(--text-strong)]">
                      {questionIndex + 1}. {question.question}
                    </legend>
                    <div className="mt-4 grid gap-2">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-3 text-sm font-semibold text-[var(--text-main)]"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            checked={answers[question.id] === optionIndex}
                            onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              <button
                type="button"
                disabled={!allAnswered}
                onClick={handleSubmit}
                className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit test
              </button>

              {quizResult ? (
                <div
                  className={`mt-5 rounded-xl border p-4 text-sm font-semibold ${
                    quizResult.passed ? "border-green-200 bg-green-50 text-green-800" : "border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  You scored {quizResult.score}/{quizResult.total} ({quizResult.scorePercent}%).
                  {quizResult.passed ? " You passed." : " Review the tutorial and try again."}
                </div>
              ) : null}
            </>
          )}

          {progressError ? <p className="mt-4 text-sm font-semibold text-red-700">{progressError}</p> : null}
        </section>

        {certificate ? (
          <section className="mt-6">
            <CertificateDocument certificate={certificate} />
            <div className="no-print mt-5 text-center">
              <button
                type="button"
                onClick={() => downloadCertificate(certificate)}
                className="inline-flex rounded-xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold text-[var(--accent)] hover:bg-[var(--panel-muted)]"
              >
                Download certificate
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function CertificateDocument({ certificate }) {
  return (
    <article className="certificate-print-area mx-auto max-w-5xl overflow-hidden rounded-[18px] border-[10px] border-[#18324f] bg-white p-2 shadow-[0_18px_48px_rgba(24,39,75,0.14)]">
      <div className="certificate-inner relative min-h-[650px] border border-[#9fb7d4] bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_48%,#eef6ff_100%)] px-10 py-9 text-center">
        <div className="pointer-events-none absolute inset-6 border border-[#d7e5f4]" />
        <div className="pointer-events-none absolute left-10 right-10 top-28 h-px bg-[#c9d9eb]" />
        <div className="pointer-events-none absolute bottom-28 left-10 right-10 h-px bg-[#c9d9eb]" />

        <header className="relative z-10 flex items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-3">
            <NextImage
              src="/images/innoai logo main.png"
              alt="InnoAI AI Explorer"
              width={72}
              height={56}
              className="h-14 w-auto object-contain"
            />
            <div>
              <p className="text-lg font-black tracking-tight text-[#10243d]">InnoAI</p>
              <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#365784]">AI Explorer</p>
            </div>
          </div>
          <div className="rounded-full border border-[#c7d8ec] px-4 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b8098]">Certificate ID</p>
            <p className="mt-1 text-xs font-black tracking-[0.12em] text-[#18324f]">{certificate.id}</p>
          </div>
        </header>

        <div className="relative z-10 mx-auto mt-16 max-w-3xl">
          <Award className="mx-auto h-12 w-12 text-[#18324f]" />
          <p className="mt-6 text-xs font-black uppercase tracking-[0.42em] text-[#365784]">Certificate of Completion</p>
          <h1 className="mt-7 text-5xl font-black tracking-tight text-[#10243d]">{certificate.userName}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#405b78]">
            is hereby awarded this certificate for successfully completing
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#18324f]">{certificate.tutorialTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#405b78]">
            with a final assessment score of <strong className="text-[#10243d]">{certificate.scorePercent}%</strong>.
          </p>
        </div>

        <footer className="relative z-10 mt-16 grid grid-cols-3 items-end gap-6 text-center">
          <div>
            <p className="border-t border-[#7f9fbd] pt-3 text-xs font-black uppercase tracking-[0.18em] text-[#365784]">
              Issued Date
            </p>
            <p className="mt-2 text-sm font-bold text-[#10243d]">{formatCertificateDate(certificate.issuedAt)}</p>
          </div>
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#18324f] bg-[#f6fbff]">
            <span className="text-2xl font-black text-[#18324f]">IA</span>
          </div>
          <div>
            <p className="border-t border-[#7f9fbd] pt-3 text-xs font-black uppercase tracking-[0.18em] text-[#365784]">
              Authorized By
            </p>
            <p className="mt-2 text-sm font-bold text-[#10243d]">InnoAI AI Explorer</p>
          </div>
        </footer>
      </div>
    </article>
  );
}
