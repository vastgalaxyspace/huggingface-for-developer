"use client";

function getStyles(state, accent) {
  if (state === "active" && accent === "orange") {
    return "border-orange-300 bg-orange-50 text-orange-700";
  }
  if (state === "active") {
    return "border-2 border-green-300 bg-green-50 text-green-700";
  }
  if (state === "waiting") {
    return "border border-gray-300 bg-white text-gray-400";
  }
  return "border border-gray-200 bg-white text-gray-300";
}

function getTitle(threadId, state) {
  if (state === "active") return `Thread ${threadId} - Active (executes if-branch)`;
  if (state === "waiting") return `Thread ${threadId} - Waiting (masked, executing else-branch)`;
  return `Thread ${threadId} - Inactive`;
}

export default function ThreadCell({ threadId, state, accent = "green" }) {
  return (
    <div
      title={getTitle(threadId, state)}
      className={`aspect-square min-h-[64px] rounded-lg transition-all duration-300 ease-in-out ${getStyles(state, accent)}`}
    >
      <div className="flex h-full w-full items-start justify-start p-2">
        <span className="font-mono text-xs">{String(threadId).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
