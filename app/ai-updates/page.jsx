export const metadata = {
  title: 'AI Updates & Technology | Model Explorer',
  description: 'Stay up-to-date with the latest AI updates and new technology in the ecosystem.',
};

import AIUpdatesList from "../../src/components/ai-updates/AIUpdatesList";
import { Zap } from "lucide-react";

export default function AIUpdatesPage() {
  return (
    <div className="shell-container py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 border-b border-[var(--border-soft)] pb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-strong)] flex items-center gap-2 whitespace-nowrap">
            <Zap className="h-5 w-5 text-blue-600" /> AI Updates
          </h1>
          <span className="hidden sm:block text-[var(--border-soft)] text-lg">|</span>
          <p className="text-[var(--text-muted)] text-sm truncate">
            Stay informed about the latest breakthroughs in artificial intelligence.
          </p>
        </div>
        
        <AIUpdatesList />
      </div>
    </div>
  );
}
