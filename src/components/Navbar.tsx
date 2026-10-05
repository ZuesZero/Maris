import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, Heart, Sparkles, Menu, X, Globe, PlusCircle, User as UserIcon, UserCheck, UserPlus, BarChart3, Users, Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { ViewMode, User, Product } from '../types';
import { Language, translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { LanguageDropdown } from './LanguageDropdown';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenBag: () => void;
  onOpenWishlist: () => void;
  onOpenStylist: () => void;
  onOpenAddProduct?: () => void;
  onSearch: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  currency: string;
  onChangeCurrency: (curr: string) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  currentUser?: User | null;
  onOpenLogin?: (mode?: 'login' | 'register') => void;
  products?: Product[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenBag,
  onOpenWishlist,
  onOpenStylist,
  onOpenAddProduct,
  onSearch,
  onCategorySelect,
  currency,
  onChangeCurrency,
  language,
  onChangeLanguage,
  currentUser,
  onOpenLogin,
  products = []
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // AI & Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-hide search bar after 5 seconds of inactivity
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (isSearchOpen && !isListening && !isAiLoading) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsSearchOpen(false);
      }, 5000);
    }
  }, [isSearchOpen, isListening, isAiLoading]);

  useEffect(() => {
    if (!isSearchOpen) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    resetInactivityTimer();

    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isSearchOpen, searchInput, isListening, isAiLoading, resetInactivityTimer]);

  // Automatically close search bar when page view changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [currentView]);

  const t = translations[language];
  const isDeveloper = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';

  const CATEGORY_NAV_ITEMS = [
    { label: language === 'es' ? "TODOS" : "ALL", isAll: true, query: '', category: '' },
    { label: language === 'es' ? "LO NUEVO" : "WHAT'S NEW", query: 'new', category: '' },
    { label: language === 'es' ? "CAMISAS" : "SHIRTS", query: '', category: 'Shirts & Silk' },
    { label: language === 'es' ? "PANTALONES" : "TROUSERS", query: '', category: 'Trousers' },
    { label: language === 'es' ? "ABRIGOS" : "OUTERWEAR", query: '', category: 'Outerwear' },
    { label: language === 'es' ? "TRAJES Y BLAZERS" : "SUITS & BLAZERS", query: '', category: 'Suits & Blazers' },
    { label: language === 'es' ? "CALZADO" : "SHOES", query: '', category: 'Shoes' },
    { label: language === 'es' ? "ACCESORIOS" : "ACCESSORIES", query: '', category: 'Accessories' },
    { label: language === 'es' ? "MISCELÁNEOS" : "MISCELLANEOUS", query: '', category: 'Miscellaneous' },
    { label: language === 'es' ? "OFERTAS" : "SALE", query: 'sale', category: '' },
  ];

  const handleToggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(
        language === 'es'
          ? 'Búsqueda por voz disponible en Chrome, Safari o Edge.'
          : 'Voice search requires Chrome, Safari, or Edge.'
      );
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(t.voiceSearchListening);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSearchInput(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceNotice(
          language === 'es'
            ? 'Error en reconocimiento de voz o permiso denegado.'
            : 'Speech error or microphone permission denied.'
        );
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceNotice(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleAiSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setIsAiLoading(true);
    setAiNote(null);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchInput.trim(), products, language })
      });
      const data = await res.json();
      if (data.aiRecommendation) {
        setAiNote(data.aiRecommendation);
      }
      onSearch(searchInput.trim());
      onNavigate('catalog');
      setIsSearchOpen(false);
    } catch (err) {
      console.error('AI Search API Call error', err);
      onSearch(searchInput.trim());
      onNavigate('catalog');
      setIsSearchOpen(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickPillSearch = (query: string) => {
    setSearchInput(query);
    onSearch(query);
    onNavigate('catalog');
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E8E2D9] transition-all duration-300">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Nav links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 text-[12px] font-medium tracking-[0.18em] uppercase text-[#1A1A1A]">
          <button
            id="nav-link-home"
            onClick={() => onNavigate('home')}
            className={`transition-colors duration-200 hover:text-[#B88A58] ${
              currentView === 'home' ? 'border-b-2 border-[#1A1A1A] pb-1' : ''
            }`}
          >
            {t.navHome}
          </button>

          {isDeveloper && (
            <>
              <button
                id="nav-link-inventory"
                onClick={() => onNavigate('inventory')}
                className={`transition-colors duration-200 hover:text-[#B88A58] flex items-center gap-1.5 font-bold ${
                  currentView === 'inventory' ? 'border-b-2 border-[#B88A58] pb-1 text-[#B88A58]' : 'text-[#1A1A1A]'
                }`}
                title={language === 'es' ? 'Libro Mayor de Inventario y Ventas Ejecutivo' : 'Executive Inventory & Sales Ledger'}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#B88A58]" />
                <span>{t.navInventory}</span>
              </button>
              <button
                id="nav-link-users"
                onClick={() => onNavigate('users')}
                className={`transition-colors duration-200 hover:text-[#B88A58] flex items-center gap-1.5 font-bold ${
                  currentView === 'users' ? 'border-b-2 border-[#1C1B20] pb-1 text-[#1C1B20]' : 'text-[#1A1A1A]'
                }`}
                title={language === 'es' ? 'Tabla de Usuarios Registrados (Acceso Desarrollador)' : 'Registered Users Table (Developer Access)'}
              >
                <Users className="w-3.5 h-3.5 text-[#1C1B20]" />
                <span>{t.navUsers}</span>
                <span className="bg-[#1C1B20] text-[#E8D0B5] text-[9px] px-1.5 py-0.2 font-mono uppercase">DEV</span>
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          id="btn-mobile-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-[#1A1A1A] hover:text-[#B88A58] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo Center */}
        <div className="text-center py-1">
          <BrandLogo
            variant="dark"
            size="md"
            onClick={() => onNavigate('home')}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageDropdown
              language={language}
              onChangeLanguage={onChangeLanguage}
              variant="light"
            />
          </div>

          {/* Currency Switcher */}
          <select
            id="select-currency"
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value)}
            className="hidden sm:block bg-transparent text-[11px] tracking-wider font-medium text-[#4A4947] focus:outline-none cursor-pointer hover:text-[#1A1A1A]"
          >
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="MXN">$ MXN</option>
          </select>

          {/* Search Trigger with AI Sparkles Badge */}
          <button
            id="btn-toggle-search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 text-[#1A1A1A] hover:text-[#B88A58] transition-colors relative flex items-center gap-1 cursor-pointer"
            title={t.aiSearchLabel}
          >
            <Search className="w-5 h-5" />
            <Sparkles className="w-3 h-3 text-[#B88A58] animate-pulse" />
          </button>

          {/* Wishlist Button */}
          <button
            id="btn-open-wishlist"
            onClick={onOpenWishlist}
            className="p-1.5 text-[#1A1A1A] hover:text-[#B88A58] transition-colors relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B88A58] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User / Login / Register Button */}
          {onOpenLogin && (
            currentUser ? (
              <button
                id="btn-open-user-profile"
                onClick={() => onOpenLogin('login')}
                className="p-1 text-[#1A1A1A] hover:text-[#B88A58] transition-colors flex items-center gap-1.5 cursor-pointer"
                title={currentUser.name}
              >
                <div className="flex items-center gap-1.5 bg-[#F4F0EA] px-2.5 py-1 rounded-sm border border-[#E8E2D9]">
                  <div className="w-5 h-5 rounded-full border border-[#B88A58] overflow-hidden shrink-0">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#1A1A1A] max-w-[90px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center bg-[#F4F0EA] rounded-sm border border-[#E8E2D9] p-0.5 shadow-2xs">
                <button
                  id="btn-open-login"
                  onClick={() => onOpenLogin('login')}
                  className="px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#1A1A1A] hover:bg-white hover:text-[#1C1B20] transition-all uppercase flex items-center gap-1 cursor-pointer rounded-xs"
                  title={language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>{language === 'es' ? 'Ingresar' : 'Login'}</span>
                </button>
                <span className="text-[#A8A09B] text-xs font-light select-none px-0.5">/</span>
                <button
                  id="btn-open-register"
                  onClick={() => onOpenLogin('register')}
                  className="px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#B88A58] hover:bg-white hover:text-[#8C6239] transition-all uppercase flex items-center gap-1 cursor-pointer rounded-xs"
                  title={language === 'es' ? 'Crear Cuenta' : 'Register Account'}
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#B88A58]" />
                  <span>{language === 'es' ? 'Registrarse' : 'Register'}</span>
                </button>
              </div>
            )
          )}

          {/* Shopping Bag Button */}
          <button
            id="btn-open-bag"
            onClick={onOpenBag}
            className="p-2 bg-[#1C1B20] text-[#F4F0EA] hover:bg-[#3B3A40] transition-colors flex items-center gap-2 rounded-sm"
            title="Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[11px] font-semibold tracking-wider">
              {t.bagLabel} ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Top Categories Navigation Bar (Solid Black Banner with White Lettering) */}
      <div className="bg-[#121212] border-t border-b border-black/20 py-2.5 px-4 overflow-x-auto no-scrollbar shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-4 sm:gap-7 md:gap-9 min-w-max px-2">
          {CATEGORY_NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.isAll) {
                  if (onCategorySelect) {
                    onCategorySelect('');
                  } else {
                    onNavigate('catalog');
                  }
                } else if (item.category && onCategorySelect) {
                  onCategorySelect(item.category);
                } else if (item.query) {
                  onSearch(item.query);
                } else {
                  onNavigate('catalog');
                }
                setIsSearchOpen(false);
              }}
              className="text-[11px] sm:text-[12px] font-sans font-bold tracking-wider uppercase text-white hover:text-gray-300 transition-colors duration-150 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable AI Search & Voice Assistant Drawer */}
      {isSearchOpen && (
        <div className="border-t border-[#E8E2D9] bg-[#F4F0EA] px-4 py-5 shadow-inner transition-all animate-fadeIn">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* AI Assistant Badge Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B88A58] animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#B88A58] font-bold">
                  {t.aiSearchLabel}
                </span>
              </div>
              {isListening && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 text-[10px] font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <Volume2 className="w-3 h-3 text-red-600" />
                  <span>{t.voiceSearchListening}</span>
                </div>
              )}
              {voiceNotice && !isListening && (
                <span className="text-[10px] text-[#8C9083] font-medium italic">
                  {voiceNotice}
                </span>
              )}
            </div>

            {/* Main AI Search Bar Input with Voice Microphone */}
            <form onSubmit={handleAiSearchSubmit} className="relative flex items-center bg-white rounded-md border-2 border-[#1A1A1A] shadow-xs focus-within:border-[#B88A58] transition-all">
              <div className="pl-3.5 text-[#B88A58] shrink-0">
                <Sparkles className="w-5 h-5 text-[#B88A58]" />
              </div>

              <input
                id="input-global-search"
                type="text"
                placeholder={t.aiSearchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent py-3 px-3 text-sm text-[#1A1A1A] focus:outline-none placeholder-[#8C9083] font-medium"
                autoFocus
              />

              {/* Action Icons inside Search Bar */}
              <div className="flex items-center gap-1.5 pr-2 shrink-0">
                {/* Clear Input Button */}
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title={language === 'es' ? 'Borrar búsqueda' : 'Clear query'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Voice Search Microphone Button */}
                <button
                  id="btn-voice-search"
                  type="button"
                  onClick={handleToggleVoiceSearch}
                  className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse shadow-md'
                      : 'text-[#1A1A1A] hover:bg-[#F4F0EA] hover:text-[#B88A58]'
                  }`}
                  title={isListening ? (language === 'es' ? 'Detener escucha' : 'Stop listening') : t.voiceSearchStart}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* AI Search Submit Button */}
                <button
                  id="btn-submit-search"
                  type="submit"
                  disabled={isAiLoading}
                  className="text-xs uppercase tracking-widest font-bold px-4 py-2.5 bg-[#1A1A1A] text-white rounded-sm hover:bg-[#B88A58] transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'es' ? 'Buscando con IA...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#E8D0B5]" />
                      <span>{t.aiSearchingBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick AI Search Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] uppercase font-bold text-[#8C9083] tracking-wider shrink-0">
                {language === 'es' ? 'Sugerencias IA:' : 'AI Prompts:'}
              </span>
              {[
                language === 'es' ? 'Abrigo Cashmere' : 'Cashmere Overcoat',
                language === 'es' ? 'Blazer Lana Italiana' : 'Italian Wool Blazer',
                language === 'es' ? 'Camisa Seda Mulberry' : 'Mulberry Silk Shirt',
                language === 'es' ? 'Bolsa Cuero Florentino' : 'Leather Weekender',
                language === 'es' ? 'Cuello Alto Cashmere' : 'Cashmere Sweater'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleQuickPillSearch(suggestion)}
                  className="text-[10px] uppercase font-semibold px-2.5 py-1 bg-white hover:bg-[#1A1A1A] hover:text-white text-[#4A4947] border border-[#E8E2D9] rounded-full transition-all shadow-2xs cursor-pointer"
                >
                  + {suggestion}
                </button>
              ))}
            </div>

            {/* AI Recommendation Note Result inside Search Drawer */}
            {aiNote && (
              <div className="p-3 bg-white border border-[#B88A58]/40 rounded-md shadow-2xs space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#B88A58] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#B88A58]" />
                  <span>{language === 'es' ? 'Recomendación del Concierge IA' : 'AI Client Concierge Recommendation'}</span>
                </div>
                <p className="text-xs text-[#1A1A1A] font-light leading-relaxed italic">
                  "{aiNote}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D9] bg-[#FBF9F5] px-6 py-6 space-y-6 animate-fadeIn max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-4 text-xs uppercase tracking-[0.2em] font-medium text-[#1A1A1A]">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-[#E8E2D9] font-bold text-[#1A1A1A]"
            >
              {t.navHome}
            </button>

            <button
              onClick={() => {
                onNavigate('catalog');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-[#E8E2D9] font-bold text-[#1A1A1A]"
            >
              {language === 'es' ? 'CATÁLOGO DE LUJO' : 'LUXURY CATALOG'}
            </button>

            <button
              onClick={() => {
                onOpenStylist();
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-[#E8E2D9] text-[#B88A58] font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#B88A58]" />
              <span>{language === 'es' ? 'CONCIERGE DE ESTILO IA' : 'AI BESPOKE STYLIST'}</span>
            </button>

            <button
              onClick={() => {
                onOpenWishlist();
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-[#E8E2D9] font-medium flex items-center justify-between text-[#1A1A1A]"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#B88A58]" />
                <span>{language === 'es' ? 'LISTA DE DESEOS' : 'WISHLIST'}</span>
              </span>
              <span className="bg-[#1C1B20] text-white text-[10px] px-2 py-0.5 font-mono font-bold rounded-full">
                {wishlistCount}
              </span>
            </button>

            <button
              onClick={() => {
                onOpenBag();
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-[#E8E2D9] font-medium flex items-center justify-between text-[#1A1A1A]"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#1C1B20]" />
                <span>{language === 'es' ? 'BOLSA DE COMPRAS' : 'SHOPPING BAG'}</span>
              </span>
              <span className="bg-[#B88A58] text-white text-[10px] px-2 py-0.5 font-mono font-bold rounded-full">
                {cartCount}
              </span>
            </button>

            {isDeveloper && (
              <>
                <button
                  onClick={() => {
                    onNavigate('inventory');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left py-2 border-b border-[#E8E2D9] text-[#B88A58] font-bold flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-[#B88A58]" />
                  <span>{t.navInventory.toUpperCase()}</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('users');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left py-2 border-b border-[#E8E2D9] text-[#1C1B20] font-bold flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-[#1C1B20]" />
                  <span>{t.navUsers.toUpperCase()}</span>
                  <span className="bg-[#1C1B20] text-[#E8D0B5] text-[9px] px-1.5 py-0.2 font-mono uppercase">DEV</span>
                </button>
              </>
            )}

            {onOpenLogin && (
              currentUser ? (
                <button
                  onClick={() => {
                    onOpenLogin('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left py-2 border-b border-[#E8E2D9] text-[#1A1A1A] font-bold flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-[#B88A58]" />
                  <span>{currentUser.name}</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 py-2 border-b border-[#E8E2D9]">
                  <button
                    id="btn-mobile-login"
                    onClick={() => {
                      onOpenLogin('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1.5 px-3 bg-[#F4F0EA] border border-[#E8E2D9] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-[#1A1A1A]" />
                    <span>{language === 'es' ? 'INGRESAR / LOGIN' : 'LOG IN'}</span>
                  </button>
                  <button
                    id="btn-mobile-register"
                    onClick={() => {
                      onOpenLogin('register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1.5 px-3 bg-[#1C1B20] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-[#B88A58]" />
                    <span>{language === 'es' ? 'REGISTRARSE' : 'CREATE ACCOUNT / REGISTER'}</span>
                  </button>
                </div>
              )
            )}
            {onOpenAddProduct && (
              <button
                onClick={() => {
                  onOpenAddProduct();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 border-b border-[#E8E2D9] text-[#1A1A1A] font-bold flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-[#B88A58]" />
                <span>UPLOAD NEW PIECE</span>
              </button>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
              <span className="text-[#8C9083] uppercase tracking-widest">Language:</span>
              <LanguageDropdown
                language={language}
                onChangeLanguage={onChangeLanguage}
                variant="light"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8C9083] uppercase tracking-widest">Select Currency:</span>
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none"
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="MXN">$ MXN</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
