import { AppProviders } from '../src/components/providers/AppProviders';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
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
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppProviders>
          <div className="min-h-screen text-slate-800">
            <Header />
            <main className="min-h-screen pb-24">
              {children}
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
