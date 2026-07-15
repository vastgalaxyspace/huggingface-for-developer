"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Check } from "lucide-react";

// Copies a shareable link (or arbitrary text) to the clipboard with brief
// "Copied!" feedback. Defaults to the current page URL, which the tool pages
// keep in sync with their state so a shared link reproduces the result.
export default function ShareButton({
  text,
  label = "Share link",
  copiedLabel = "Link copied!",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = async () => {
    const value = text ?? (typeof window !== "undefined" ? window.location.href : "");
    if (!value) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for insecure contexts / older browsers.
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — leave the button in its idle state.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
        copied
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-gray-300 bg-white text-[#23425f] hover:bg-gray-50"
      } ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
