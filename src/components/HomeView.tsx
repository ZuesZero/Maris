import React, { useState, useRef } from 'react';
import { Product, ViewMode, User } from '../types';
import { ArrowRight, Sparkles, Heart, ShoppingBag, Eye, ShieldCheck, Feather, Award, Globe, PlusCircle, Upload, UserCheck, User as UserIcon, Pencil } from 'lucide-react';
import { Language, translations } from '../data/translations';
import { formatPrice } from '../utils/currency';
import { getTranslatedProduct } from '../utils/productTranslations';

const ProductCardImage: React.FC<{
  images: string[];
  name: string;
  isHovered: boolean;
}> = ({ images, name, isHovered }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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
      className="w-full h-full relative touch-pan-y select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={activeSrc}
        alt={name}
        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
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

interface HomeViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: ViewMode) => void;
  onQuickAdd: (product: Product, size: any) => void;
  onToggleWishlist: (productId: string) => void;
  wishlistIds: string[];
  onOpenStylist: () => void;
  onOpenAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  currency: string;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
  currentUser?: User | null;
  onOpenLogin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onSelectProduct,
  onNavigate,
  onQuickAdd,
  onToggleWishlist,
  wishlistIds,
  onOpenStylist,
  onOpenAddProduct,
  onEditProduct,
  currency,
  language,
  onChangeLanguage,
  initialCategory,
  onCategoryChange,
  currentUser,
  onOpenLogin
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(initialCategory || 'All');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const isAdminUser = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategoryTab(initialCategory);
    }
  }, [initialCategory]);

  const handleTabClick = (catKey: string) => {
    setActiveCategoryTab(catKey);
    if (onCategoryChange) {
      onCategoryChange(catKey);
    }
  };

  const t = translations[language];

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const getCategoryName = (categoryKey: string) => {
    switch (categoryKey) {
      case 'Outerwear': return t.categoryOuterwear;
      case 'Suits & Blazers': return t.categorySuits;
      case 'Knitwear': return t.categoryKnitwear;
      case 'Trousers': return t.categoryTrousers;
      case 'Accessories': return t.categoryAccessories;
      case 'Miscellaneous': return t.categoryMiscellaneous || (language === 'es' ? 'Misceláneos' : 'Miscellaneous');
      default: return categoryKey || t.categoryAll;
    }
  };

  const filteredProducts = activeCategoryTab === 'All'
    ? products
    : products.filter(p => p.category === activeCategoryTab);

  return (
    <div className="space-y-24 pb-20 animate-fadeIn">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[380px] sm:min-h-[440px] lg:h-[52vh] lg:max-h-[500px] w-full overflow-hidden bg-[#1C1B20] text-[#F4F0EA] flex items-center py-8 sm:py-12">
        {/* Background Editorial Image */}
        <div className="absolute inset-0">
          <img
            src="https://i.ytimg.com/vi/I4M9DluNqWY/maxresdefault.jpg"
            alt="Mari's Autumn 2026 Campaign"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[85%_top] sm:object-[right_top] opacity-85 scale-100 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1B20] via-[#1C1B20]/80 sm:via-[#1C1B20]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B20] via-transparent to-black/30 opacity-70"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 py-6">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B88A58]/25 border border-[#B88A58]/50 rounded-full text-[#E8D0B5] text-[11px] font-mono tracking-widest uppercase backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B88A58]" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.1em] text-white leading-tight uppercase">
              {t.heroTitleLine1} <br />
              <span className="italic font-normal text-[#E8D0B5]">{t.heroTitleHighlight}</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#E2DCDA] font-light leading-relaxed max-w-lg">
              {t.heroSubtitle}
            </p>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5">
              <button
                id="btn-hero-discover"
                onClick={() => onNavigate('catalog')}
                className="px-6 sm:px-8 py-3.5 bg-[#F4F0EA] text-[#1C1B20] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#B88A58] hover:text-white transition-all flex items-center gap-2.5 rounded-sm shadow-xl cursor-pointer"
              >
                <span>{t.heroDiscover}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center text-[#A8A09B] text-[10px] tracking-[0.3em] uppercase hidden md:block z-10">
          <p>{t.heroScroll}</p>
          <div className="w-0.5 h-4 bg-[#A8A09B]/40 mx-auto mt-1 animate-bounce"></div>
        </div>
      </section>

      {/* 3. CURATED ESSENTIALS COLLECTION OVERVIEW */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
          {filteredProducts.slice(0, 16).map((rawProduct) => {
            const product = getTranslatedProduct(rawProduct, language);
            const isWishlisted = wishlistIds.includes(product.id);
            const isHovered = hoveredProductId === product.id;

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="group relative bg-white border border-[#E8E2D9] rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-[#B88A58]/40"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                {/* Image Container */}
                <div
                  className="relative aspect-[4/5] bg-[#F4F0EA] overflow-hidden cursor-pointer"
                  onClick={() => onSelectProduct(rawProduct)}
                >
                  <ProductCardImage
                    images={product.images}
                    name={product.name}
                    isHovered={isHovered}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isAdminUser && onEditProduct && (
                      <button
                        id={`btn-edit-home-${product.id}`}
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
                        {t.badgeNewArrival}
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className="px-2.5 py-1 bg-[#B88A58] text-white text-[9px] uppercase tracking-widest font-semibold rounded-xs">
                        {t.badgeBestseller}
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
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B88A58] text-[#B88A58]' : ''}`} />
                  </button>

                  {/* Quick View overlay button */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="w-full py-2 bg-white text-[#1A1A1A] text-xs uppercase tracking-widest font-semibold hover:bg-[#1C1B20] hover:text-white transition-colors flex items-center justify-center gap-2 rounded-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.quickView}</span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#8C9083] font-mono">
                      {getCategoryName(product.category)}
                    </p>
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-serif text-xl font-light text-[#1A1A1A] hover:text-[#B88A58] cursor-pointer transition-colors mt-1 line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#666562] line-clamp-1 font-light mt-0.5">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Price & Quick Add */}
                  <div className="pt-2 border-t border-[#E8E2D9] flex items-center justify-between">
                    <span className="font-sans font-medium text-base text-[#1A1A1A] tracking-tight tabular-nums">
                      {formatPrice(product.price, currency)}
                    </span>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const totalUnits = rawProduct.stock
                          ? Object.values(rawProduct.stock).reduce((a: number, b: number) => a + b, 0)
                          : (rawProduct.stockQuantity !== undefined ? rawProduct.stockQuantity : 0);

                        return totalUnits === 0 ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-mono font-semibold rounded-2xs">
                            {language === 'es' ? 'Agotado' : 'Out of Stock'}
                          </span>
                        ) : totalUnits <= 5 ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[9px] font-mono font-semibold rounded-2xs flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            {totalUnits} {language === 'es' ? 'disp.' : 'left'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-mono font-medium rounded-2xs flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-600"></span>
                            {totalUnits} {language === 'es' ? 'disp.' : 'pcs'}
                          </span>
                        );
                      })()}

                      <button
                        onClick={() => onQuickAdd(rawProduct, rawProduct.sizes[0] || 'One Size')}
                        className="p-1.5 text-[#1A1A1A] hover:text-[#B88A58] hover:bg-[#F4F0EA] transition-colors rounded-sm"
                        title={`Quick add size ${rawProduct.sizes[0] || 'One Size'}`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => onNavigate('catalog')}
            className="px-10 py-4 bg-[#1C1B20] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B88A58] transition-colors rounded-sm inline-flex items-center gap-3 shadow-md"
          >
            <span>{t.exploreCatalog} ({products.length} {language === 'es' ? 'Piezas' : 'Pieces'})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="px-8 py-4 bg-[#F4F0EA] border border-[#B88A58] text-[#1C1B20] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#1C1B20] hover:text-white transition-colors rounded-sm inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#B88A58]" />
              <span>{language === 'es' ? 'CARGAR NUEVA PIEZA' : 'UPLOAD NEW PIECE'}</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. MOVEMENT & STRUCTURE EDITORIAL BANNER - REMOVED AS REQUESTED */}
    </div>
  );
};
