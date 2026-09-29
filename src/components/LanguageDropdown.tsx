import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '../data/translations';

interface LanguageDropdownProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  variant?: 'light' | 'dark' | 'hero';
  className?: string;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  language,
  onChangeLanguage,
  variant = 'light',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Button background & text styling based on variant
  const buttonStyle =
    variant === 'hero'
      ? 'bg-[#1C1B20]/80 backdrop-blur-md border border-[#F4F0EA]/30 text-[#F4F0EA] hover:bg-[#2C2B30]'
      : variant === 'dark'
      ? 'bg-[#2A292F] border border-[#44434A] text-white hover:bg-[#35343B]'
      : 'bg-[#EFECE6] border border-[#E2DDD5] text-[#1C1B20] hover:bg-[#E5E1D8] shadow-xs';

  const globeColor =
    variant === 'hero' ? 'text-[#E8D0B5]' : variant === 'dark' ? 'text-[#B88A58]' : 'text-[#506266]';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${buttonStyle}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className={`w-4 h-4 ${globeColor} shrink-0`} />
        <span className="font-sans font-semibold tracking-tight">{currentLangObj.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-44 bg-[#F5F3EF] border border-[#E2DDD5] rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onChangeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#EAE6DE] text-[#1C1B20]'
                    : 'text-[#3E3C3A] hover:bg-[#EAE6DE]/70'
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-[#1C2C30] flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
