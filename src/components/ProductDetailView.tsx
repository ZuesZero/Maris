import React, { useState, useRef } from 'react';
import { Product, Size, User } from '../types';
import { Language } from '../data/translations';
import { Heart, ShoppingBag, Sparkles, ShieldCheck, Truck, RotateCcw, ChevronDown, ChevronUp, Star, Ruler, Check, Share2, ArrowRight, ArrowLeft, Pencil, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { getTranslatedProduct, getCategoryDisplayName } from '../utils/productTranslations';
import { getImageFrameStyles } from '../utils/imageFrame';
import { ImageFrameAdjusterModal } from './ImageFrameAdjusterModal';

interface ProductDetailViewProps {
  product: Product;
  onAddToCart: (product: Product, size: Size, color: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
  onOpenSizeGuide: () => void;
  onOpenStylist: () => void;
  currency: string;
  onBack?: () => void;
  currentUser?: User | null;
  onEditProduct?: (product: Product) => void;
  language?: Language;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product: rawProduct,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onSelectProduct,
  allProducts,
  onOpenSizeGuide,
  onOpenStylist,
  currency,
  onBack,
  currentUser,
  onEditProduct,
  language = 'en'
}) => {
  const product = getTranslatedProduct(rawProduct, language);
  const isAdminUser = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0] || 'EU 48');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || '');
  const [openAccordion, setOpenAccordion] = useState<'fit' | 'fabric' | 'care' | 'shipping'>('fit');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Picture frame adjustment tool state
  const [isFrameToolOpen, setIsFrameToolOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(rawProduct);

  const activeProduct = getTranslatedProduct(currentProduct, language);
  const frameStyles = getImageFrameStyles(activeProduct);

  const handleUpdateProductFromTool = (updated: Product) => {
    setCurrentProduct(updated);
    if (onEditProduct) {
      onEditProduct(updated);
    }
  };

  // Swipe gesture detection state for mobile / touch screens
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current !== null && touchEndY.current !== null ? Math.abs(touchStartY.current - touchEndY.current) : 0;

    // Trigger image change if horizontal swipe distance > 30px and horizontal movement exceeds vertical scroll
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swiped Left -> Next picture
        setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
      } else {
        // Swiped Right -> Previous picture
        setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  // Find complementary products for "Complete the Look"
  const complementaryProducts = allProducts.filter(p =>
    product.completeTheLookIds?.includes(p.id)
  );

  const currentStock = (product.stock && product.stock[selectedSize] !== undefined)
    ? product.stock[selectedSize]
    : (product.stockQuantity !== undefined ? product.stockQuantity : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Header Bar with Return Button & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              window.history.back();
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1B20] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#B88A58] transition-all cursor-pointer shadow-xs group"
          title={language === 'es' ? 'Regresar a la sección anterior' : 'Return to previous section'}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{language === 'es' ? 'REGRESAR A SECCIÓN ANTERIOR' : 'RETURN TO PREVIOUS SECTION'}</span>
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="text-xs uppercase tracking-[0.2em] text-[#8C9083] font-mono flex items-center gap-2">
          <button
            onClick={() => {
              if (onBack) onBack();
              else window.history.back();
            }}
            className="hover:text-[#1A1A1A] cursor-pointer"
          >
            {language === 'es' ? 'Colección' : 'Collection'}
          </button>
          <span>/</span>
          <span>{getCategoryDisplayName(product.category, language)}</span>
          <span>/</span>
          <span className="text-[#1A1A1A] font-bold">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Gallery Section (7 columns on large screens) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div
            className="relative aspect-[4/5] max-h-[480px] rounded-sm overflow-hidden border border-[#E8E2D9] group mx-auto touch-pan-y select-none cursor-grab active:cursor-grabbing flex items-center justify-center transition-all duration-300"
            style={frameStyles.containerStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              style={frameStyles.imageStyle}
              className="w-full h-full transition-all duration-300 pointer-events-none select-none"
            />

            {/* Picture Frame Adjustment Tool Trigger (for luis.delarosacosio@gmail.com and active users) */}
            <button
              type="button"
              onClick={() => setIsFrameToolOpen(true)}
              className="absolute top-3 right-3 z-20 px-2.5 py-1.5 bg-[#1C1B20]/85 hover:bg-[#1C1B20] text-white text-[10px] font-mono tracking-wider rounded-md shadow-lg border border-[#B88A58]/60 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
              title={language === 'es' ? 'Ajustar marco y tamaño de imagen (Luis de la Rosa)' : 'Adjust picture frame & size tool (Luis de la Rosa)'}
            >
              <Sliders className="w-3.5 h-3.5 text-[#B88A58]" />
              <span className="hidden sm:inline">
                {language === 'es' ? 'Ajustar Marco (Luis)' : 'Adjust Frame (Luis)'}
              </span>
              <span className="sm:hidden">
                {language === 'es' ? 'Marco' : 'Frame'}
              </span>
            </button>

            {/* Previous & Next Navigation Overlay Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#1C1B20]/75 hover:bg-[#1C1B20] text-white rounded-full transition-all duration-200 opacity-90 sm:opacity-0 group-hover:opacity-100 z-10 shadow-md cursor-pointer active:scale-95"
                  title={language === 'es' ? 'Imagen anterior' : 'Previous image (Swipe or Click)'}
                  aria-label={language === 'es' ? 'Imagen anterior' : 'Previous image'}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#1C1B20]/75 hover:bg-[#1C1B20] text-white rounded-full transition-all duration-200 opacity-90 sm:opacity-0 group-hover:opacity-100 z-10 shadow-md cursor-pointer active:scale-95"
                  title={language === 'es' ? 'Siguiente imagen' : 'Next image (Swipe or Click)'}
                  aria-label={language === 'es' ? 'Siguiente imagen' : 'Next image'}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Mobile Dot Navigation Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-[#1C1B20]/60 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        selectedImageIndex === idx ? 'w-5 bg-[#B88A58]' : 'w-1.5 bg-white/70 hover:bg-white'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-[#1C1B20]/80 text-white text-[10px] font-mono px-3 py-1 rounded-full backdrop-blur-xs z-10">
              {selectedImageIndex + 1} / {product.images.length}
            </div>
          </div>

          {/* Gallery Thumbnail Strip */}
          <div className="grid grid-cols-4 gap-3 max-w-[460px] mx-auto">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-[4/5] max-h-[90px] rounded-sm overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx ? 'border-[#1C1B20] ring-2 ring-[#B88A58]/50' : 'border-[#E8E2D9] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Details Panel (5 columns on large screens) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Category & Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#B88A58]">
                {getCategoryDisplayName(product.category, language)}
              </span>
              <span className="text-xs font-mono text-[#8C9083]">
                SKU: AL-{product.id.substring(0, 6).toUpperCase()}
              </span>
            </div>

            {/* Admin Edit Controls Bar for Luis */}
            {isAdminUser && onEditProduct && (
              <div className="p-3 bg-[#FAF8F5] border border-[#B88A58]/60 rounded-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#B88A58] animate-pulse"></div>
                  <div>
                    <p className="text-[11px] font-bold text-[#1C1B20] uppercase tracking-wider">
                      {language === 'es' ? 'MODO ADMINISTRADOR LUIS' : 'LUIS ADMIN MODE'}
                    </p>
                    <p className="text-[10px] text-[#66635B]">
                      {language === 'es' ? 'Editar pieza subida o prenda de colección' : 'Edit uploaded piece or collection garment'}
                    </p>
                  </div>
                </div>
                <button
                  id={`btn-edit-detail-${product.id}`}
                  onClick={() => onEditProduct(rawProduct)}
                  className="px-3.5 py-1.5 bg-[#B88A58] text-white hover:bg-[#1C1B20] text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5 text-white" />
                  <span>{language === 'es' ? 'EDITAR PIEZA' : 'EDIT PIECE'}</span>
                </button>
              </div>
            )}

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A] leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#666562] font-light leading-relaxed">
                {product.subtitle}
              </p>
              <div className="pt-2 font-sans text-2xl font-medium tracking-tight text-[#1A1A1A] tabular-nums flex items-baseline flex-wrap gap-x-2">
                <span>{formatPrice(product.price, currency)}</span>
                <span className="text-xs font-sans text-[#8C9083] font-normal tracking-normal">
                  {language === 'es' ? '(Impuestos incluidos, envío de regalo)' : '(Taxes included, complimentary shipping)'}
                </span>
              </div>
            </div>

            {/* Color Swatch Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-[#1A1A1A]">
                  {language === 'es' ? 'COLOR:' : 'COLOR:'} <span className="font-normal text-[#666562]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all flex items-center justify-center ${
                      selectedColor === c.name ? 'border-[#1A1A1A] ring-2 ring-[#B88A58]/40 scale-110' : 'border-[#E8E2D9]'
                    }`}
                    title={c.name}
                  >
                    <span className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: c.hex }}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-[#1A1A1A]">
                  {language === 'es' ? 'TALLA DE LA PRENDA (EU)' : 'Garment Size (EU)'}
                </span>
                <button
                  onClick={onOpenSizeGuide}
                  className="text-[#B88A58] hover:underline flex items-center gap-1 font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Guía de Tallas y Ajuste' : 'Size Guide & Fits'}</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => {
                  const sizeStock = (product.stock && product.stock[s] !== undefined)
                    ? product.stock[s]
                    : (product.stockQuantity !== undefined ? product.stockQuantity : 0);
                  const isSelected = selectedSize === s;

                  return (
                    <button
                      key={s}
                      disabled={sizeStock === 0}
                      onClick={() => setSelectedSize(s)}
                      className={`py-3 text-xs font-mono rounded-xs border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        sizeStock === 0
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-[#1C1B20] text-white border-[#1C1B20] font-bold shadow-md cursor-pointer'
                          : 'bg-white text-[#1A1A1A] border-[#E8E2D9] hover:border-[#1A1A1A] cursor-pointer'
                      }`}
                    >
                      <span>{s}</span>
                      <span className={`text-[9px] ${sizeStock === 0 ? 'text-rose-500 font-semibold' : isSelected ? 'text-[#DED3C4]' : 'text-[#8C9083]'}`}>
                        ({sizeStock} {language === 'es' ? 'disp.' : 'left'})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stock Status Indicator */}
              <div className={`text-[11px] font-mono flex items-center gap-1.5 pt-1 ${currentStock > 0 ? 'text-[#B88A58]' : 'text-red-600 font-semibold'}`}>
                <span className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-[#B88A58] animate-pulse' : 'bg-red-600'}`}></span>
                <span>
                  {currentStock > 0
                    ? (language === 'es'
                        ? `Solo ${currentStock} ${currentStock === 1 ? 'disponible' : 'disponibles'} en ${selectedSize} — Envío en 24 horas`
                        : `Only ${currentStock} left in ${selectedSize} — Ships within 24 hours`)
                    : (language === 'es'
                        ? `Agotado en tienda para ${selectedSize}`
                        : `Out of stock in store for ${selectedSize}`)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                id="btn-add-to-bag"
                disabled={currentStock === 0}
                onClick={handleAdd}
                className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-semibold transition-all rounded-sm shadow-md flex items-center justify-center gap-2 ${
                  currentStock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none border border-gray-300'
                    : addedAnimation
                    ? 'bg-[#8C9083] text-white'
                    : 'bg-[#1C1B20] text-white hover:bg-[#B88A58]'
                }`}
              >
                {currentStock === 0 ? (
                  <span>{language === 'es' ? 'AGOTADO EN TIENDA' : 'OUT OF STOCK IN STORE'}</span>
                ) : addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>{language === 'es' ? 'Añadido a la Bolsa' : 'Added to Shopping Bag'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {language === 'es'
                        ? `AÑADIR A LA BOLSA • ${formatPrice(product.price, currency)}`
                        : `Add to Shopping Bag • ${formatPrice(product.price, currency)}`}
                    </span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`py-3 px-4 border text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'border-[#B88A58] text-[#B88A58] bg-[#B88A58]/10'
                      : 'border-[#E8E2D9] text-[#1A1A1A] hover:border-[#1A1A1A]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B88A58]' : ''}`} />
                  <span>
                    {isWishlisted
                      ? (language === 'es' ? 'Guardado en Lista' : 'Saved to Wishlist')
                      : (language === 'es' ? 'Guardar en Lista' : 'Save to Wishlist')}
                  </span>
                </button>

                <button
                  onClick={onOpenStylist}
                  className="py-3 px-4 border border-[#B88A58] text-[#B88A58] hover:bg-[#B88A58] hover:text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'es' ? 'Estilista IA' : 'Ask AI Stylist'}</span>
                </button>
              </div>
            </div>

            {/* Complimentary Perks Banner */}
            <div className="p-4 bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-2 text-xs text-[#4A4947]">
              <div className="flex items-center gap-2 text-[#1A1A1A] font-semibold">
                <Truck className="w-4 h-4 text-[#B88A58]" />
                <span>
                  {language === 'es'
                    ? 'Envío Exprés Gratuito y Devoluciones en 14 Días'
                    : 'Complimentary Express Delivery & 14-Day Returns'}
                </span>
              </div>
              <p className="text-[11px] text-[#666562]">
                {language === 'es'
                  ? 'Incluye funda de terciopelo exclusiva para la prenda, percha de madera de cedro y nota personalizada.'
                  : 'Includes signature velvet-lined garment dust bag, wooden cedar coat hanger, and personalized client note.'}
              </p>
            </div>

            {/* Accordion Sections */}
            <div className="border-t border-[#E8E2D9] pt-4 divide-y divide-[#E8E2D9]">
              {/* Section 1: Architectural Fit */}
              <div className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'fit' ? ('' as any) : 'fit')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] py-1"
                >
                  <span>{language === 'es' ? 'Diseño y Ajuste Arquitectónico' : 'Design & Architectural Fit'}</span>
                  {openAccordion === 'fit' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'fit' && (
                  <div className="pt-3 pb-2 text-xs text-[#666562] leading-relaxed space-y-2 animate-fadeIn">
                    <p>{product.description}</p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-[#4A4947]">
                      <li>
                        {language === 'es'
                          ? 'El modelo mide 188cm y viste talla EU 48'
                          : 'Model is 188cm / 6\'2" wearing EU size 48'}
                      </li>
                      <li>
                        {language === 'es'
                          ? 'Diseñado para un caída holgada y estructurada'
                          : 'Designed for a relaxed yet structured shoulder mantle'}
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 2: Material Provenance */}
              <div className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'fabric' ? ('' as any) : 'fabric')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] py-1"
                >
                  <span>{language === 'es' ? 'Procedencia del Tejido y Materiales' : 'Fabric & Material Provenance'}</span>
                  {openAccordion === 'fabric' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'fabric' && (
                  <div className="pt-3 pb-2 text-xs text-[#666562] leading-relaxed space-y-1.5 animate-fadeIn">
                    {product.fabricDetails.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#B88A58]">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Care & Maintenance */}
              <div className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? ('' as any) : 'care')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] py-1"
                >
                  <span>{language === 'es' ? 'Cuidado de la Prenda' : 'Garment Care'}</span>
                  {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'care' && (
                  <div className="pt-3 pb-2 text-xs text-[#666562] leading-relaxed space-y-1.5 animate-fadeIn">
                    {product.garmentCare.map((care, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#B88A58]">•</span>
                        <span>{care}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT REVIEWS & REFLECTIONS */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="pt-10 border-t border-[#E8E2D9] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#B88A58] font-semibold">
                {language === 'es' ? 'Reflexiones de Clientes' : 'Client Reflections'}
              </p>
              <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mt-1">
                {language === 'es' ? `Reseñas Verificadas (${product.reviews.length})` : `Verified Reviews (${product.reviews.length})`}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#1A1A1A] font-semibold">
              <div className="flex text-[#B88A58]">★★★★★</div>
              <span>{language === 'es' ? 'Calificación 5.0 de 5.0' : '5.0 out of 5.0 Rating'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="p-6 bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#B88A58]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B88A58]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#8C9083]">{rev.date}</span>
                </div>
                <h4 className="font-serif text-lg text-[#1A1A1A] font-normal">{rev.title}</h4>
                <p className="text-xs text-[#666562] leading-relaxed italic">"{rev.comment}"</p>
                <div className="pt-2 flex items-center justify-between text-[10px] uppercase font-semibold text-[#1A1A1A]">
                  <span>{rev.author} — {rev.location}</span>
                  {rev.verified && <span className="text-[#B88A58] font-mono">{language === 'es' ? '✓ Cliente Verificado' : '✓ Verified Patron'}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPLETE THE LOOK RELATED ITEMS */}
      {complementaryProducts.length > 0 && (
        <section className="pt-12 border-t border-[#E8E2D9] space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#B88A58] font-semibold">
                {language === 'es' ? 'Armonía Sastorial' : 'Sartorial Harmony'}
              </p>
              <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mt-1">
                {language === 'es' ? 'Completa el Look' : 'Complete The Look'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {complementaryProducts.map((rawComp) => {
              const comp = getTranslatedProduct(rawComp, language);
              return (
                <div
                  key={comp.id}
                  className="group bg-white border border-[#E8E2D9] rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div
                    className="aspect-[3/4] bg-[#F4F0EA] overflow-hidden cursor-pointer relative"
                    onClick={() => onSelectProduct(rawComp)}
                  >
                    <img
                      src={comp.images[0]}
                      alt={comp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-[#8C9083] font-mono">
                      {getCategoryDisplayName(comp.category, language)}
                    </p>
                    <h3
                      onClick={() => onSelectProduct(rawComp)}
                      className="font-serif text-lg font-light text-[#1A1A1A] hover:text-[#B88A58] cursor-pointer"
                    >
                      {comp.name}
                    </h3>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
                      <span className="font-sans text-sm sm:text-base font-medium text-[#1A1A1A] tabular-nums tracking-tight">
                        {formatPrice(comp.price, currency)}
                      </span>
                      <button
                        onClick={() => onAddToCart(rawComp, comp.sizes[0], comp.colors[0]?.name || '')}
                        className="px-3 py-1.5 bg-[#1C1B20] text-white text-[10px] uppercase tracking-wider font-semibold rounded-xs hover:bg-[#B88A58] transition-colors"
                      >
                        {language === 'es' ? '+ Añadir Prenda' : '+ Add Pair'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Picture Frame Adjustment Modal */}
      <ImageFrameAdjusterModal
        isOpen={isFrameToolOpen}
        onClose={() => setIsFrameToolOpen(false)}
        product={currentProduct}
        onUpdateProduct={handleUpdateProductFromTool}
        currentUser={currentUser}
        language={language}
      />
    </div>
  );
};
