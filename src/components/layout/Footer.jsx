import { Heart, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/20 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Internal Navigation for SEO */}
        <nav aria-label="Footer navigation" className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Explore
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Tools</h3>
              <ul className="space-y-1.5">
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Model Analyzer
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    VRAM Calculator
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Model Comparison
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Smart Recommender
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Features</h3>
              <ul className="space-y-1.5">
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    License Checker
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Hardware Guide
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    TCO Calculator
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Benchmark Viewer
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Resources</h3>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://huggingface.co/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    HuggingFace Models
                  </a>
                </li>
                <li>
                  <a
                    href="https://huggingface.co/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    HuggingFace Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://huggingface.co/spaces"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    HuggingFace Spaces
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">About</h3>
              <ul className="space-y-1.5">
                <li>
                  <span className="text-gray-400">
                    Free &amp; Open Source
                  </span>
                </li>
                <li>
                  <span className="text-gray-400">
                    Built for Developers
                  </span>
                </li>
                <li>
                  <span className="text-gray-400">
                    No Login Required
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" aria-hidden="true" />
              <span>for developers</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a 
                href="https://huggingface.co" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Data from HuggingFace
              </a>
              <span className="text-gray-600" aria-hidden="true">•</span>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                <span>Open Source</span>
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>HuggingFace Model Explorer — Free AI model analysis tool for developers.</p>
            <p className="mt-1">Analyze VRAM requirements, check licenses, compare LLMs, and get deployment recommendations.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;