import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles, Download } from 'lucide-react';
import { Language, translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (view: 'home' | 'catalog' | 'editorial' | 'concierge') => void;
  onOpenStylist: () => void;
  language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenStylist, language = 'en' }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const t = translations[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#1C1B20] text-[#F4F0EA] pt-16 pb-12 border-t border-[#333238]">
      {/* Value Pillars Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-[#2C2B30] grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#2A292F] text-[#B88A58] rounded-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-white">{t.footerWorldwideTitle}</h4>
            <p className="text-xs text-[#A8A09B] mt-1 leading-relaxed">
              {t.footerWorldwideDesc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#2A292F] text-[#B88A58] rounded-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-white">{t.footerArtisanshipTitle}</h4>
            <p className="text-xs text-[#A8A09B] mt-1 leading-relaxed">
              {t.footerArtisanshipDesc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#2A292F] text-[#B88A58] rounded-sm">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-white">{t.footerReturnsTitle}</h4>
            <p className="text-xs text-[#A8A09B] mt-1 leading-relaxed">
              {t.footerReturnsDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <BrandLogo
              variant="light"
              size="lg"
              onClick={() => onNavigate('home')}
            />
          </div>
          <p className="text-xs text-[#A8A09B] max-w-sm leading-relaxed pt-1">
            {t.footerBrandDesc}
          </p>
          <div className="pt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B88A58]"></span>
            <p className="text-xs font-semibold text-[#E6DFD5] tracking-widest uppercase">
              CEO &amp; Owner Luis De La Rosa
            </p>
          </div>
          <button
            onClick={onOpenStylist}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-[#B88A58] text-[#B88A58] hover:bg-[#B88A58] hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold rounded-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.footerConsultConcierge}</span>
          </button>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D5CECE]">
            {t.footerCollectionsHeader}
          </h4>
          <ul className="space-y-2 text-xs text-[#A8A09B] font-medium">
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                {t.categoryOuterwear}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                {t.categorySuits}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                {t.categoryKnitwear}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                {t.categoryTrousers}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                Mulberry Silk
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                Florentine Leather
              </button>
            </li>
          </ul>
        </div>

        {/* Client Services */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D5CECE]">
            {t.footerClientServicesHeader}
          </h4>
          <ul className="space-y-2 text-xs text-[#A8A09B] font-medium">
            <li>
              <a href="#appointments" className="hover:text-white transition-colors">
                Private Showroom Appointments
              </a>
            </li>
            <li>
              <a href="#sizeguide" className="hover:text-white transition-colors">
                Bespoke Fit & Size Guide
              </a>
            </li>
            <li>
              <a href="#garmentcare" className="hover:text-white transition-colors">
                Garment Provenance & Care
              </a>
            </li>
            <li>
              <a href="#returns" className="hover:text-white transition-colors">
                Express Shipping & Returns
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact Concierge
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media Links Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D5CECE]">
            Connect
          </h4>
          <p className="text-xs text-[#A8A09B] leading-relaxed">
            Follow our latest seasonal releases, bespoke ateliers, and editorial stories.
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-[#2A292F] hover:bg-[#B88A58] text-[#D5CECE] hover:text-white flex items-center justify-center transition-all duration-200 border border-[#3D3B43]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.6 13.78 5.6c1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.23 0-1.61.77-1.61 1.56V12h2.78l-.45 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-[#2A292F] hover:bg-[#B88A58] text-[#D5CECE] hover:text-white flex items-center justify-center transition-all duration-200 border border-[#3D3B43]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-9 h-9 rounded-full bg-[#2A292F] hover:bg-[#B88A58] text-[#D5CECE] hover:text-white flex items-center justify-center transition-all duration-200 border border-[#3D3B43]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="w-9 h-9 rounded-full bg-[#2A292F] hover:bg-[#B88A58] text-[#D5CECE] hover:text-white flex items-center justify-center transition-all duration-200 border border-[#3D3B43]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright & Legal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 mt-12 border-t border-[#2C2B30] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#888380]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 self-start sm:self-auto">
          <p>© {new Date().getFullYear()} {t.footerRights}</p>
          <span className="hidden sm:inline text-[#44434A]">•</span>
          <p className="font-semibold text-[#E6DFD5] tracking-wider uppercase">
            CEO &amp; Owner Luis De La Rosa
          </p>
        </div>
        <div className="flex flex-wrap gap-6 mt-4 sm:mt-0 uppercase tracking-widest font-medium items-center">
          <a
            href="/api/download-zip"
            download="maris-luxury-fashion-project.zip"
            className="text-[#B88A58] hover:text-[#d3a16d] flex items-center gap-1.5 transition-colors cursor-pointer"
            title={language === 'es' ? 'Descargar código fuente completo en archivo .ZIP' : 'Download complete source code as .ZIP'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Descargar Proyecto (.ZIP)' : 'Download Project (.ZIP)'}</span>
          </a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#ethics" className="hover:text-white transition-colors">Sustainability Charter</a>
        </div>
      </div>
    </footer>
  );
};
