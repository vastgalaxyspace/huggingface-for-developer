import { AppProviders } from '../src/components/providers/AppProviders';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import ComparisonBar from '../src/components/comparison/ComparisonBar';
import './globals.css';

export const metadata = {
  title: 'HuggingFace Model Explorer - Analyze Any LLM Instantly',
  description: 'Decode any HuggingFace model in seconds. Get VRAM requirements, license analysis, parameter explanations, and deployment recommendations for AI models. Free developer tool for LLM evaluation.',
  keywords: 'huggingface, llm, model analysis, vram calculator, ai models, machine learning, transformers, model comparison, deployment guide, llm benchmark, model parameters, gpu requirements, ai developer tools',
  authors: [{ name: 'HuggingFace Model Explorer' }],
  applicationName: 'HF Model Explorer',
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <Header />
            <main className="min-h-screen pb-24">
              {children}
            </main>
            <ComparisonBar />
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
