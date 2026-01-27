import { Heart, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/20 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-current" />
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
            <span className="text-gray-600">•</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Open Source</span>
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          This tool helps developers evaluate models. Always verify license terms before deployment.
        </div>
      </div>
    </footer>
  );
};

export default Footer;