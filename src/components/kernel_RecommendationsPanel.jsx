"use client";

import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { getSeverityStyles, sectionLabelClassName } from "./kernel_utils";

function SeverityIcon({ severity }) {
  if (severity === "critical") return <XCircle className="h-5 w-5" />;
  if (severity === "warning") return <AlertTriangle className="h-5 w-5" />;
  if (severity === "success") return <CheckCircle2 className="h-5 w-5" />;
  return <Lightbulb className="h-5 w-5" />;
}

export default function RecommendationsPanel({ recommendations, onApplyFix }) {
  if (!recommendations?.length) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className={sectionLabelClassName}>Recommendations</p>
      <div className="mt-4 space-y-4">
        {recommendations.map((recommendation, index) => {
          const styles = getSeverityStyles(recommendation.severity);
          return (
            <div key={`${recommendation.title}-${index}`} className={`rounded-xl border border-gray-200 border-l-4 p-4 ${styles.bg} ${styles.border}`}>
              <div className={`flex items-start gap-3 ${styles.text}`}>
                <SeverityIcon severity={recommendation.severity} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{recommendation.title}</p>
                  <p className="mt-2 text-sm">{recommendation.body}</p>
                  {recommendation.action ? (
                    <button type="button" onClick={() => onApplyFix(recommendation.action)} className={`mt-4 rounded-lg px-4 py-2 text-sm font-medium transition ${styles.button}`}>
                      Apply Fix
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
