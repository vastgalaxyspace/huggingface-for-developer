import { Suspense } from "react";
import RooflineAnalyzerClient from "../../../../src/components/roofline/RooflineAnalyzerClient";

export default function RooflineModelAnalyzerPage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-slate-100 py-8 md:py-12">
      <div className="shell-container">
        <Suspense fallback={null}>
          <RooflineAnalyzerClient />
        </Suspense>
      </div>
    </div>
  );
}
