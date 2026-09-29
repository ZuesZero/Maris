import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface BrandSplashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreCollection: () => void;
}

export const BrandSplashModal: React.FC<BrandSplashModalProps> = ({
  isOpen,
  onClose,
  onExploreCollection
}) => {
  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B20]/95 backdrop-blur-xl p-4 transition-all duration-500 animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#A8A09B] hover:text-white transition-colors p-2"
        aria-label="Close intro"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-xl w-full text-center text-[#F4F0EA] p-8 sm:p-12 border border-[#3E3C45] bg-[#1C1B20] rounded-sm shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#B88A58]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Logo Presentation */}
        <div className="my-6">
          <BrandLogo variant="light" size="xl" />
        </div>

        <p className="mt-6 text-sm text-[#D5CECE] font-light leading-relaxed max-w-md mx-auto">
          "Quiet Elegance. Architectural Precision. Uncompromising Virgin Cashmere & Pure Mulberry Silk."
        </p>

        <p className="mt-3 text-xs text-[#8C9083] font-mono tracking-widest uppercase">
          Biella & Florence • Autumn 2026
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              onClose();
              onExploreCollection();
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#B88A58] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#a3794b] transition-all flex items-center justify-center gap-2 rounded-sm shadow-md"
          >
            <span>Discover Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 border border-[#3E3C45] text-[#D5CECE] hover:text-white hover:border-[#B88A58] text-xs uppercase tracking-[0.2em] font-medium transition-all rounded-sm"
          >
            Enter House
          </button>
        </div>
      </div>
    </div>
  );
};
