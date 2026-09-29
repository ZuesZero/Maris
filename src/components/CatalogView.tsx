import React, { useState, useMemo, useRef } from 'react';
import { Product, FilterState, User, Category } from '../types';
import { Language } from '../data/translations';
import { Eye, Heart, ShoppingBag, SlidersHorizontal, X, ArrowUpDown, Grid, LayoutGrid, PlusCircle, Pencil, Sparkles, Mic, MicOff, Search } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { getTranslatedProduct, getCategoryDisplayName } from '../utils/productTranslations';
import { getImageFrameStyles } from '../utils/imageFrame';

const ProductCardImage: React.FC<{
  images: string[];
  name: string;
  isHovered: boolean;
  product?: Product;
}> = ({ images, name, isHovered, product }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const frameStyles = getImageFrameStyles(product);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current !== null ? Math.abs(touchStartY.current - touchEndY) : 0;

    if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > deltaY && images.length > 1) {
      if (deltaX > 0) {
        setCurrentIdx((prev) => (prev + 1) % images.length);
      } else {
        setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const activeSrc = isHovered && images[1] && currentIdx === 0 ? images[1] : (images[currentIdx] || images[0]);

  return (
    <div
      className="w-full h-full relative touch-pan-y select-none flex items-center justify-center transition-all duration-300"
      style={frameStyles.containerStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={activeSrc}
        alt={name}
        style={frameStyles.imageStyle}
        className="w-full h-full transition-all duration-500 pointer-events-none select-none group-hover:scale-105"
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 bg-[#1C1B20]/60 px-2 py-0.5 rounded-full sm:hidden">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                (isHovered && idx === 1 && currentIdx === 0) || currentIdx === idx ? 'w-3 bg-[#B88A58]' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CatalogViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: any) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
  currency: string;
  initialCategory?: string;
  initialSearchQuery?: string;
  onOpenAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onCategoryChange?: (category: string) => void;
  currentUser?: User | null;
  language?: Language;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
  onToggleWishlist,
  wishlistIds,
  currency,
  initialCategory = '',
  initialSearchQuery = '',
  onOpenAddProduct,
  onEditProduct,
  onCategoryChange,
  currentUser,
  language = 'en'
}) => {
  const isAdminUser = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    color: '',
    size: '',
    maxPrice: 3000,
    sortBy: 'featured',
    searchQuery: initialSearchQuery
  });

  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: initialCategory,
      searchQuery: initialSearchQuery
    }));
  }, [initialCategory, initialSearchQuery]);

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState<3 | 4 | 2>(3);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [quickSizeProductId, setQuickSizeProductId] = useState<string | null>(null);

  // Catalog Voice Search State
  const [isListeningCatalog, setIsListeningCatalog] = useState(false);
  const catalogRecognitionRef = useRef<any>(null);

  const handleToggleCatalogVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        language === 'es'
          ? 'La búsqueda por voz está disponible en Chrome, Safari o Edge.'
          : 'Voice search is available in Google Chrome, Apple Safari, or Microsoft Edge.'
      );
      return;
    }

    if (isListeningCatalog && catalogRecognitionRef.current) {
      try { catalogRecognitionRef.current.stop(); } catch (e) {}
      setIsListeningCatalog(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognition.onstart = () => {
        setIsListeningCatalog(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setFilters(prev => ({ ...prev, searchQuery: transcript }));
      };

      recognition.onerror = () => {
        setIsListeningCatalog(false);
      };

      recognition.onend = () => {
        setIsListeningCatalog(false);
      };

      catalogRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Catalog speech error', err);
      setIsListeningCatalog(false);
    }
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const categories: Category[] = ['Outerwear', 'Suits & Blazers', 'Knitwear', 'Trousers', 'Shirts & Silk', 'Shoes', 'Accessories', 'Miscellaneous'];
  const colors = [
    { name: 'Oatmeal', hex: '#D8CFB9' },
    { name: 'Midnight', hex: '#1C1B20' },
    { name: 'Warm Camel', hex: '#B88A58' },
    { name: 'Charcoal', hex: '#3E3D40' },
    { name: 'Sage', hex: '#8C9083' },
    { name: 'Cream', hex: '#F7F5EE' },
    { name: 'Navy', hex: '#1A2433' },
    { name: 'Espresso', hex: '#3B2F2F' },
    { name: 'Cognac', hex: '#9E5B32' }
  ];
  const sizes = ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54', 'One Size'];

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (filters.category && filters.category !== 'All' && filters.category !== 'Todos' && p.category !== filters.category) return false;

      // Color filter
      if (filters.color) {
        const hasColor = p.colors.some(c => c.name.toLowerCase().includes(filters.color.toLowerCase()));
        if (!hasColor) return false;
      }

      // Size filter
      if (filters.size && !p.sizes.includes(filters.size as any)) return false;

      // Price filter
      if (p.price > filters.maxPrice) return false;

      // Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        if (q === 'new') {
          if (!p.isNewArrival) return false;
        } else if (q === 'bestseller') {
          if (!p.isBestseller) return false;
        } else if (q === 'sale') {
          if (p.price > 1800 && !p.isFeatured) return false;
        } else {
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesSub = p.subtitle.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesCat = p.category.toLowerCase().includes(q);
          if (!matchesName && !matchesSub && !matchesDesc && !matchesCat) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, filters]);

  const totalFilteredStockUnits = useMemo(() => {
    return filteredProducts.reduce((acc, p) => {
      const units = p.stock ? Object.values(p.stock).reduce((a: number, b: number) => a + b, 0) : (p.stockQuantity ?? 0);
      return acc + units;
    }, 0);
  }, [filteredProducts]);

  const handleResetFilters = () => {
    setFilters({
      category: '',
      color: '',
      size: '',
      maxPrice: 3000,
      sortBy: 'featured',
      searchQuery: ''
    });
  };

  return (
    <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Catalog Title Header */}
      <div className="border-b border-[#E8E2D9] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B88A58] font-semibold">
            {language === 'es' ? 'Otoño 2026' : 'Autumn 2026'}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[0.1em] text-[#1A1A1A]">
            {filters.category ? getCategoryDisplayName(filters.category as any, language) : (language === 'es' ? 'Colección de Esenciales' : 'The Essentials Collection')}
          </h1>
          <p className="text-xs sm:text-sm text-[#666562] max-w-2xl font-light">
            {language === 'es'
              ? 'Siluetas arquitectónicas, cashmere de doble faz sin forro y seda Mulberry fina. Confeccionado a mano en Biella y Florencia para una distinción atemporal.'
              : 'Architectural silhouettes, unlined double-faced cashmere, and fine mulberry silk. Hand-tailored in Biella and Florence for timeless distinction.'}
          </p>
        </div>
        {onOpenAddProduct && (
          <button
            onClick={onOpenAddProduct}
            className="px-5 py-2.5 bg-[#1C1B20] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#3B3A40] transition-colors flex items-center gap-2 shadow-xs cursor-pointer self-start md:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#B88A58]" />
            <span>{language === 'es' ? 'CARGAR NUEVA PIEZA' : 'UPLOAD NEW PIECE'}</span>
          </button>
        )}
      </div>

      {/* Filter & View Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F4F0EA] p-4 rounded-sm border border-[#E8E2D9]">
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-open-filter-drawer"
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="px-4 py-2 bg-[#1C1B20] text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#B88A58] transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {language === 'es' ? 'Filtros' : 'Filters'} {(filters.category || filters.color || filters.size || filters.searchQuery) ? (language === 'es' ? '• Activos' : '• Active') : ''}
            </span>
          </button>

          {/* Quick Category Pills */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#1C1B20] p-1.5 rounded-sm border border-[#2D2C34] shadow-sm">
            <button
              onClick={() => setFilters({ ...filters, category: '' })}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-xs font-semibold transition-colors cursor-pointer ${
                !filters.category
                  ? 'bg-white text-[#1C1B20] font-bold shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              {language === 'es' ? 'Todos' : 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-xs font-semibold transition-colors cursor-pointer ${
                  filters.category === cat
                    ? 'bg-white text-[#1C1B20] font-bold shadow-xs'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                {getCategoryDisplayName(cat, language)}
              </button>
            ))}
          </div>
        </div>

        {/* Right Sort & Layout Toggle */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Active Results Count */}
          <span className="text-xs text-[#8C9083] font-mono">
            {filteredProducts.length} {filteredProducts.length === 1 ? (language === 'es' ? 'Pieza' : 'Piece') : (language === 'es' ? 'Piezas' : 'Pieces')}
            {' • '}
            <span className="text-[#1C1B20] font-semibold">
              {totalFilteredStockUnits} {language === 'es' ? 'unidades en stock' : 'units available'}
            </span>
          </span>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8C9083]" />
            <select
              id="select-catalog-sort"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="bg-transparent text-xs font-medium text-[#1A1A1A] focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="featured">{language === 'es' ? 'Orden: Destacados' : 'Sort: Featured'}</option>
              <option value="price-asc">{language === 'es' ? 'Precio: Menor a Mayor' : 'Price: Low to High'}</option>
              <option value="price-desc">{language === 'es' ? 'Precio: Mayor a Menor' : 'Price: High to Low'}</option>
              <option value="newest">{language === 'es' ? 'Orden: Más Recientes' : 'Sort: Newest'}</option>
            </select>
          </div>

          {/* Grid Layout Toggle */}
          <div className="hidden md:flex items-center gap-1 border-l border-[#D5CECE] pl-3">
            <button
              onClick={() => setGridColumns(2)}
              className={`p-1.5 rounded-xs ${gridColumns === 2 ? 'bg-[#1C1B20] text-white' : 'text-[#666562] hover:text-[#1A1A1A]'}`}
              title="2-Column Editorial View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridColumns(3)}
              className={`p-1.5 rounded-xs ${gridColumns === 3 ? 'bg-[#1C1B20] text-white' : 'text-[#666562] hover:text-[#1A1A1A]'}`}
              title="3-Column Classic View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Drawer Panel */}
      {isFilterDrawerOpen && (
        <div className="p-6 bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
            <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">{language === 'es' ? 'Refinar Selección' : 'Refine Selection'}</h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#B88A58] underline uppercase tracking-wider hover:text-[#1A1A1A]"
            >
              {language === 'es' ? 'Restablecer Filtros' : 'Reset All Filters'}
            </button>
          </div>

          {/* AI & Voice Search bar inside Catalog */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B88A58]" />
                <span>{language === 'es' ? 'Consulta por Búsqueda de Voz e IA' : 'AI & Voice Garment Query'}</span>
              </label>
              {isListeningCatalog && (
                <span className="text-[10px] font-bold text-red-600 animate-pulse flex items-center gap-1">
                  <Mic className="w-3 h-3 text-red-600" /> {language === 'es' ? 'Escuchando... Habla ahora' : 'Listening... Speak now'}
                </span>
              )}
            </div>

            <div className="relative flex items-center bg-white border border-[#1A1A1A] rounded-xs shadow-2xs">
              <Search className="w-4 h-4 text-[#8C9083] ml-3 shrink-0" />
              <input
                id="input-catalog-voice-search"
                type="text"
                placeholder={language === 'es' ? 'Buscar cashmere, seda, abrigo, cruzado, color, talle...' : 'Search cashmere, silk, overcoat, double-breasted, color, size...'}
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-transparent py-2 px-3 text-xs text-[#1A1A1A] focus:outline-none placeholder-[#8C9083]"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, searchQuery: '' })}
                  className="p-1 text-gray-400 hover:text-gray-600 pr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleCatalogVoice}
                className={`p-2 transition-colors cursor-pointer border-l border-[#E8E2D9] ${
                  isListeningCatalog ? 'bg-red-600 text-white animate-pulse' : 'text-[#1A1A1A] hover:text-[#B88A58] hover:bg-[#FBF9F5]'
                }`}
                title="Voice Search"
              >
                {isListeningCatalog ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">{language === 'es' ? 'Categoría' : 'Category'}</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full bg-white border border-[#E8E2D9] p-2 text-xs text-[#1A1A1A] rounded-xs focus:outline-none"
              >
                <option value="">{language === 'es' ? 'Todas las Categorías' : 'All Categories'}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{getCategoryDisplayName(cat, language)}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">{language === 'es' ? 'Paleta de Color' : 'Color Palette'}</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setFilters({ ...filters, color: filters.color === c.name ? '' : c.name })}
                    className={`px-2.5 py-1 text-[10px] uppercase font-medium rounded-xs border transition-all flex items-center gap-1.5 ${
                      filters.color === c.name
                        ? 'border-[#1A1A1A] bg-[#1C1B20] text-white'
                        : 'border-[#E8E2D9] bg-white text-[#4A4947] hover:border-[#1A1A1A]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }}></span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">{language === 'es' ? 'Talle' : 'Garment Size'}</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ ...filters, size: filters.size === s ? '' : s })}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-xs border transition-all ${
                      filters.size === s
                        ? 'bg-[#1C1B20] text-white border-[#1C1B20]'
                        : 'bg-white text-[#4A4947] border-[#E8E2D9] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold uppercase tracking-wider text-[#1A1A1A]">{language === 'es' ? 'Precio Máximo' : 'Max Price'}</label>
                <span className="font-mono text-[#B88A58] font-bold">{getCurrencySymbol(currency)}{filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="400"
                max="3000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-[#1C1B20] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Badges Pill Bar */}
      {(filters.category || filters.color || filters.size || filters.searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-[#8C9083] font-medium uppercase tracking-wider">Active Filters:</span>
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1B20] text-white text-[10px] uppercase font-semibold rounded-full">
              Category: {filters.category}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, category: '' })} />
            </span>
          )}
          {filters.color && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1B20] text-white text-[10px] uppercase font-semibold rounded-full">
              Color: {filters.color}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, color: '' })} />
            </span>
          )}
          {filters.size && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1B20] text-white text-[10px] uppercase font-semibold rounded-full">
              Size: {filters.size}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, size: '' })} />
            </span>
          )}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B88A58] text-white text-[10px] uppercase font-semibold rounded-full">
              Query: "{filters.searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, searchQuery: '' })} />
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-[#B88A58] hover:underline uppercase tracking-wider ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-4">
          <p className="font-serif text-2xl text-[#1A1A1A]">No pieces match your exact criteria.</p>
          <p className="text-xs text-[#8C9083]">Try relaxing your filter parameters or clearing your search term.</p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-[#1C1B20] text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-[#B88A58] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-3.5 sm:gap-6 lg:gap-8 ${
            gridColumns === 2
              ? 'grid-cols-2 sm:grid-cols-2'
              : gridColumns === 3
              ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {filteredProducts.map((rawProduct) => {
            const product = getTranslatedProduct(rawProduct, language || 'en');
            const isWishlisted = wishlistIds.includes(product.id);
            const isHovered = hoveredProductId === product.id;
            const showQuickSizes = quickSizeProductId === product.id;

            const totalUnits = rawProduct.stock 
              ? Object.values(rawProduct.stock).reduce((a: number, b: number) => a + b, 0)
              : (rawProduct.stockQuantity !== undefined ? rawProduct.stockQuantity : 0);

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="group relative bg-white border border-[#E8E2D9] rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-[#B88A58]/40"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => {
                  setHoveredProductId(null);
                  setQuickSizeProductId(null);
                }}
              >
                {/* Image Viewport */}
                <div
                  className="relative aspect-[4/5] bg-[#F4F0EA] overflow-hidden cursor-pointer"
                  onClick={() => onSelectProduct(rawProduct)}
                >
                  <ProductCardImage
                    images={product.images}
                    name={product.name}
                    isHovered={isHovered}
                    product={product}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isAdminUser && onEditProduct && (
                      <button
                        id={`btn-edit-catalog-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(product);
                        }}
                        className="px-2.5 py-1 bg-[#B88A58] hover:bg-[#1C1B20] text-white text-[9px] uppercase tracking-widest font-bold rounded-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
                        title="Edit piece (Luis Delarosa Admin)"
                      >
                        <Pencil className="w-3 h-3 text-white" />
                        <span>Edit</span>
                      </button>
                    )}
                    {product.isNewArrival && (
                      <span className="px-2.5 py-1 bg-[#1C1B20] text-white text-[9px] uppercase tracking-widest font-semibold rounded-xs">
                        NEW
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className="px-2.5 py-1 bg-[#B88A58] text-white text-[9px] uppercase tracking-widest font-semibold rounded-xs">
                        BESTSELLER
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-[#1A1A1A] hover:text-[#B88A58] shadow-sm transition-transform hover:scale-110 z-10"
                    title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B88A58] text-[#B88A58]' : ''}`} />
                  </button>

                  {/* Quick Add Size Overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-10">
                    {showQuickSizes ? (
                      <div className="bg-white p-3 rounded-xs space-y-2 animate-fadeIn shadow-lg">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] text-center">
                          {language === 'es' ? 'Seleccionar Talla para Añadir' : 'Select Size to Add'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {product.sizes.map((s) => {
                            const sizeStock = (rawProduct.stock && rawProduct.stock[s] !== undefined)
                              ? rawProduct.stock[s]
                              : (rawProduct.stockQuantity ?? 0);
                            const isOutOfStock = sizeStock === 0;

                            return (
                              <button
                                key={s}
                                disabled={isOutOfStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isOutOfStock) {
                                    onQuickAdd(rawProduct, s);
                                    setQuickSizeProductId(null);
                                  }
                                }}
                                className={`px-2 py-1 text-[10px] font-mono border rounded-xs transition-colors flex items-center gap-1 ${
                                  isOutOfStock
                                    ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed line-through'
                                    : 'border-[#1A1A1A] hover:bg-[#1C1B20] hover:text-white cursor-pointer bg-white'
                                }`}
                                title={isOutOfStock ? (language === 'es' ? 'Talla agotada' : 'Size out of stock') : `${sizeStock} ${language === 'es' ? 'disponibles' : 'available'}`}
                              >
                                <span>{s}</span>
                                <span className={`text-[9px] ${isOutOfStock ? 'text-neutral-400' : 'text-[#B88A58] font-bold'}`}>
                                  ({sizeStock})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(rawProduct);
                          }}
                          className="flex-1 py-2 bg-white text-[#1A1A1A] text-[11px] uppercase tracking-widest font-semibold hover:bg-[#F4F0EA] transition-colors rounded-xs flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'es' ? 'Inspeccionar' : 'Inspect'}</span>
                        </button>
                        <button
                          disabled={totalUnits === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (totalUnits > 0) {
                              setQuickSizeProductId(product.id);
                            }
                          }}
                          className={`flex-1 py-2 text-white text-[11px] uppercase tracking-widest font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors ${
                            totalUnits === 0
                              ? 'bg-neutral-400 cursor-not-allowed'
                              : 'bg-[#B88A58] hover:bg-[#a3794b] cursor-pointer'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{totalUnits === 0 ? (language === 'es' ? 'Agotado' : 'Out of Stock') : (language === 'es' ? 'Añadir' : 'Quick Add')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Bottom Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-[#8C9083] font-mono">
                        {product.category}
                      </span>
                      {product.colors.length > 0 && (
                        <div className="flex items-center gap-1">
                          {product.colors.map((c) => (
                            <span
                              key={c.name}
                              className="w-2.5 h-2.5 rounded-full border border-black/20"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            ></span>
                          ))}
                        </div>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectProduct(rawProduct)}
                      className="font-serif text-xl font-light text-[#1A1A1A] hover:text-[#B88A58] cursor-pointer transition-colors mt-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#666562] line-clamp-2 font-light mt-1">
                      {product.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D9] flex items-center justify-between">
                    <span className="font-sans font-medium text-base text-[#1A1A1A] tracking-tight tabular-nums">
                      {formatPrice(product.price, currency)}
                    </span>

                    {totalUnits === 0 ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-semibold rounded-2xs">
                        {language === 'es' ? 'Agotado' : 'Out of Stock'}
                      </span>
                    ) : totalUnits <= 5 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-mono font-semibold rounded-2xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {totalUnits} {language === 'es' ? 'disp. (Bajo)' : 'left (Low stock)'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-medium rounded-2xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {totalUnits} {language === 'es' ? 'disponibles' : 'available'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
