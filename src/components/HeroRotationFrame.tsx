import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Upload, X, Trash2, Plus, Check, Pencil } from 'lucide-react';
import { Language } from '../data/translations';
import { optimizeImageFile } from '../utils/productStorage';
import {
  HeroSlideItem,
  getStoredHeroSlidesSync,
  saveHeroSlidesLocal,
  saveHeroSlideToFirestore,
  deleteHeroSlideFromFirestore,
  subscribeToHeroSlides
} from '../utils/heroSlideStorage';

interface HeroRotationFrameProps {
  language: Language;
  isAdminUser: boolean;
  onSeeDetails: () => void;
}

const ROTATION_INTERVAL_MS = 10 * 1000; // 10 seconds (10,000 ms)

const UNIQUE_FASHION_FALLBACKS = [
  {
    kickerEn: 'Central Atelier',
    kickerEs: 'Atelier Central',
    badgeEn: 'COLLECTION_AW26',
    badgeEs: 'COLECCIÓN_AW26',
    titleEn: 'Avant-Garde\nTailoring',
    titleEs: 'Sastrería de\nVanguardia',
    subtitleEn: 'Artisanal Italian cashmere tailoring and strategic seasonal wardrobe curation',
    subtitleEs: 'Confección artesanal en cachemira italiana y diseño exclusivo de temporada'
  },
  {
    kickerEn: 'Fashion House',
    kickerEs: 'Casa de Moda',
    badgeEn: 'HAUTE_COUTURE',
    badgeEs: 'ALTA_COSTURA',
    titleEn: 'Contemporary\nSilhouette',
    titleEs: 'Silueta\nContemporánea',
    subtitleEn: 'Architectural cuts, noble European textiles, and timeless luxury garments',
    subtitleEs: 'Cortes arquitectónicos, tejidos nobles europeos y prendas de lujo atemporal'
  },
  {
    kickerEn: 'Silk & Linen Archive',
    kickerEs: 'Archivo Textil',
    badgeEn: 'SILK_ARCHIVE',
    badgeEs: 'ARCHIVO_SEDA',
    titleEn: 'Quiet Luxury\nEssentials',
    titleEs: 'Esenciales de\nLujo Silencioso',
    subtitleEn: 'Hand-finished garments, organic silk shirts, and bespoke styling excellence',
    subtitleEs: 'Prendas terminadas a mano, camisería en seda orgánica y estilismo privado'
  },
  {
    kickerEn: 'Private Showroom',
    kickerEs: 'Showroom Privado',
    badgeEn: 'RUNWAY_EDITION',
    badgeEs: 'EDICIÓN_PASARELA',
    titleEn: 'Bespoke Runway\nCollection',
    titleEs: 'Colección Privada\nde Pasarela',
    subtitleEn: 'Exclusive limited-edition fashion pieces and signature leather accessories',
    subtitleEs: 'Piezas de moda de edición limitada y accesorios de piel de autor'
  },
  {
    kickerEn: 'Signature Capsule',
    kickerEs: 'Cápsula de Autor',
    badgeEn: 'ATELIER_LUXE',
    badgeEs: 'ATELIER_LUJO',
    titleEn: 'Timeless Elegance\n& Draping',
    titleEs: 'Elegancia Atemporal\ny Drapeado',
    subtitleEn: 'Refined silhouettes crafted for modern sophistication and effortless poise',
    subtitleEs: 'Siluetas refinadas creadas para la sofisticación moderna y porte distinguido'
  }
];

export const HeroRotationFrame: React.FC<HeroRotationFrameProps> = ({
  language,
  isAdminUser,
  onSeeDetails
}) => {
  const isEs = language === 'es';
  const [slides, setSlides] = useState<HeroSlideItem[]>(() => getStoredHeroSlidesSync());
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isBorderLit, setIsBorderLit] = useState<boolean>(false);
  const borderLightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerBorderLight = () => {
    setIsBorderLit(true);
    if (borderLightTimeoutRef.current) {
      clearTimeout(borderLightTimeoutRef.current);
    }
    borderLightTimeoutRef.current = setTimeout(() => {
      setIsBorderLit(false);
    }, 900);
  };

  // Upload / Manage Modal State (for luis.delarosacosio@gmail.com)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'add' | 'replace'>('add');
  const [editingSlideIdx, setEditingSlideIdx] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [kickerInput, setKickerInput] = useState<string>('');
  const [badgeInput, setBadgeInput] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [subtitleInput, setSubtitleInput] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time Firestore updates for hero slides
  useEffect(() => {
    const unsub = subscribeToHeroSlides((liveSlides) => {
      setSlides(liveSlides);
    });
    return () => unsub();
  }, []);

  // Ensure activeIdx stays within bounds when slides change
  useEffect(() => {
    if (activeIdx >= slides.length && slides.length > 0) {
      setActiveIdx(0);
    }
  }, [slides.length, activeIdx]);

  // 10-Second automatic rotation timer
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isAutoPlaying, activeIdx, slides.length]);

  const currentSlide = slides[activeIdx] || slides[0];

  const loadSlideIntoForm = (slide: HeroSlideItem, idx: number) => {
    setEditingSlideIdx(idx);
    setActiveIdx(idx);
    setPreviewImage(slide.image || '');
    setImageUrlInput('');
    setKickerInput(isEs ? slide.kickerEs || slide.kicker : slide.kicker);
    setBadgeInput(isEs ? slide.badgeEs || slide.badge : slide.badge);
    setTitleInput(isEs ? slide.titleEs || slide.title : slide.title);
    setSubtitleInput(isEs ? slide.subtitleEs || slide.subtitle : slide.subtitle);
  };

  const openUploadModal = (initialMode: 'add' | 'replace' = 'add') => {
    setUploadMode(initialMode);
    if (initialMode === 'replace' && currentSlide) {
      loadSlideIntoForm(currentSlide, activeIdx);
    } else {
      setEditingSlideIdx(activeIdx);
      setPreviewImage('');
      setImageUrlInput('');
      // Start empty so user can write custom sentences for the new image
      setKickerInput('');
      setBadgeInput('');
      setTitleInput('');
      setSubtitleInput('');
    }
    setIsUploadModalOpen(true);
  };

  const handleSelectMode = (mode: 'add' | 'replace') => {
    setUploadMode(mode);
    if (mode === 'replace') {
      const targetSlide = slides[editingSlideIdx] || currentSlide;
      if (targetSlide) {
        loadSlideIntoForm(targetSlide, editingSlideIdx);
      }
    } else {
      setPreviewImage('');
      setImageUrlInput('');
      setKickerInput('');
      setBadgeInput('');
      setTitleInput('');
      setSubtitleInput('');
    }
  };

  const handleSelectSlideToEdit = (idx: number) => {
    const target = slides[idx];
    if (!target) return;
    setUploadMode('replace');
    loadSlideIntoForm(target, idx);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const optimized = await optimizeImageFile(file);
      setPreviewImage(optimized);
    } catch (err) {
      console.error('Error optimizing hero image:', err);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = previewImage || imageUrlInput.trim();
    if (!finalImage) return;

    if (uploadMode === 'replace') {
      const targetSlide = slides[editingSlideIdx] || currentSlide;
      if (!targetSlide) return;

      const fallback = UNIQUE_FASHION_FALLBACKS[editingSlideIdx % UNIQUE_FASHION_FALLBACKS.length];
      const nextKicker = kickerInput.trim() || (isEs ? fallback.kickerEs : fallback.kickerEn);
      const nextBadge = badgeInput.trim() || (isEs ? fallback.badgeEs : fallback.badgeEn);
      const nextTitle = titleInput.trim() || (isEs ? fallback.titleEs : fallback.titleEn);
      const nextSubtitle = subtitleInput.trim() || (isEs ? fallback.subtitleEs : fallback.subtitleEn);

      const updatedSlide: HeroSlideItem = {
        ...targetSlide,
        image: finalImage,
        kicker: nextKicker,
        kickerEs: nextKicker,
        badge: nextBadge,
        badgeEs: nextBadge,
        title: nextTitle,
        titleEs: nextTitle,
        subtitle: nextSubtitle,
        subtitleEs: nextSubtitle,
        updatedAt: new Date().toISOString()
      };
      const nextSlides = slides.map((s, idx) => (idx === editingSlideIdx ? updatedSlide : s));
      setSlides(nextSlides);
      setActiveIdx(editingSlideIdx);
      saveHeroSlidesLocal(nextSlides);
      await saveHeroSlideToFirestore(updatedSlide);
    } else {
      const fallback = UNIQUE_FASHION_FALLBACKS[slides.length % UNIQUE_FASHION_FALLBACKS.length];
      const nextKicker = kickerInput.trim() || (isEs ? fallback.kickerEs : fallback.kickerEn);
      const nextBadge = badgeInput.trim() || (isEs ? fallback.badgeEs : fallback.badgeEn);
      const nextTitle = titleInput.trim() || (isEs ? fallback.titleEs : fallback.titleEn);
      const nextSubtitle = subtitleInput.trim() || (isEs ? fallback.subtitleEs : fallback.subtitleEn);

      const newSlide: HeroSlideItem = {
        id: `hero-slide-${Date.now()}`,
        image: finalImage,
        kicker: nextKicker,
        kickerEs: nextKicker,
        badge: nextBadge,
        badgeEs: nextBadge,
        title: nextTitle,
        titleEs: nextTitle,
        subtitle: nextSubtitle,
        subtitleEs: nextSubtitle,
        order: slides.length,
        updatedAt: new Date().toISOString()
      };
      const nextSlides = [...slides, newSlide];
      setSlides(nextSlides);
      setActiveIdx(nextSlides.length - 1);
      saveHeroSlidesLocal(nextSlides);
      await saveHeroSlideToFirestore(newSlide);
    }

    setIsUploadModalOpen(false);
  };

  const handleDeleteSlide = async (slideId: string, idx: number) => {
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((s) => s.id !== slideId);
    setSlides(nextSlides);
    const nextIdx = Math.min(activeIdx, nextSlides.length - 1);
    setActiveIdx(Math.max(0, nextIdx));
    if (uploadMode === 'replace' && nextSlides[nextIdx]) {
      loadSlideIntoForm(nextSlides[nextIdx], nextIdx);
    }
    saveHeroSlidesLocal(nextSlides);
    await deleteHeroSlideFromFirestore(slideId);
  };

  const displayKicker = isEs
    ? currentSlide?.kickerEs || currentSlide?.kicker
    : currentSlide?.kicker;
  const displayBadge = isEs
    ? currentSlide?.badgeEs || currentSlide?.badge
    : currentSlide?.badge;
  const displayTitle = isEs
    ? currentSlide?.titleEs || currentSlide?.title
    : currentSlide?.title;
  const displaySubtitle = isEs
    ? currentSlide?.subtitleEs || currentSlide?.subtitle
    : currentSlide?.subtitle;

  return (
    <section className="w-full bg-white text-[#1A1A1A] pt-1.5 pb-2.5 sm:pt-2 sm:pb-3 px-2 sm:px-3 lg:px-4 border-b border-[#E8E2D9]">
      <div className="w-full mx-auto">
        {/* Top Control Bar - Only visible to luis.delarosacosio@gmail.com (isAdminUser) */}
        {isAdminUser && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md border border-[#B88A58]/50 bg-[#FBF9F5] text-[#9A6B3B] text-[11px] font-mono font-bold tracking-wider uppercase">
                10S ROTATION FRAME
              </span>
              <span className="text-xs font-mono text-[#6B6661] tracking-wide">
                {activeIdx + 1} / {slides.length}{' '}
                {isEs ? 'Slides in Rotation' : 'Slides in Rotation'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className="px-3 py-1.5 rounded-md border border-[#DED8CE] bg-[#FBF9F5] hover:border-[#B88A58] text-[#1C1B20] text-[11px] font-mono tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                title={
                  isAutoPlaying
                    ? isEs
                      ? 'Pausar rotación automática de 10 segundos'
                      : 'Pause 10-second auto rotation'
                    : isEs
                    ? 'Reanudar rotación automática de 10 segundos'
                    : 'Resume 10-second auto rotation'
                }
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-[#1C1B20]" />
                    <span>10s AUTO</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-[#B88A58]" />
                    <span>PAUSED</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-hero-edit-slide-text"
                onClick={() => openUploadModal('replace')}
                className="px-3 py-1.5 rounded-md border border-[#B88A58]/50 bg-[#FBF9F5] hover:bg-[#B88A58]/15 text-[#9A6B3B] text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Pencil className="w-3 h-3" />
                <span>{isEs ? `EDITAR TEXTO (#${activeIdx + 1})` : `EDIT TEXT (#${activeIdx + 1})`}</span>
              </button>

              <button
                type="button"
                id="btn-hero-upload-image"
                onClick={() => openUploadModal('add')}
                className="px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#D49B35] to-[#E8B647] hover:from-[#E5AD42] hover:to-[#F2C357] text-[#111111] text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>UPLOAD IMAGE</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Rounded Showcase Frame */}
        <div
          onMouseEnter={triggerBorderLight}
          onMouseLeave={() => setIsBorderLit(false)}
          className={`group relative rounded-2xl overflow-hidden bg-[#1C1108] min-h-[380px] sm:min-h-[450px] lg:min-h-[490px] flex items-center transition-all duration-[1600ms] ease-out ${
            isBorderLit
              ? 'border-2 border-[#E59A38] shadow-[0_0_28px_rgba(229,154,56,0.55),inset_0_0_18px_rgba(229,154,56,0.35)]'
              : 'border border-[#B88A58]/30 shadow-2xl'
          }`}
        >
          {/* Luminous Border Edge Light Overlay that illuminates on zoom and disappears slowly */}
          <div
            className={`pointer-events-none absolute inset-0 rounded-2xl z-30 border-2 border-[#F5A638] shadow-[inset_0_1px_12px_rgba(245,166,56,0.65),0_0_24px_rgba(245,166,56,0.5)] transition-opacity duration-[1800ms] ease-out ${
              isBorderLit ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Background Slide Image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              key={currentSlide?.id}
              src={currentSlide?.image}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center brightness-105 scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Lighter warm left gradient so image stays bright and vibrant while text remains legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E1006]/65 via-[#1E1006]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120904]/45 via-transparent to-transparent" />
          </div>

          {/* Corner Reticle Brackets matching reference picture */}
          <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-[#D49B35]/65 pointer-events-none z-10" />
          <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-[#D49B35]/65 pointer-events-none z-10" />

          {/* Left & Right Circular Slide Navigation Buttons */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length)}
                aria-label={isEs ? 'Imagen anterior' : 'Previous slide'}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E1006]/55 hover:bg-[#381E0E]/85 border border-[#B88A58]/45 hover:border-[#D49B35] text-white flex items-center justify-center backdrop-blur-xs shadow-lg transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setActiveIdx((prev) => (prev + 1) % slides.length)}
                aria-label={isEs ? 'Siguiente imagen' : 'Next slide'}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E1006]/55 hover:bg-[#381E0E]/85 border border-[#B88A58]/45 hover:border-[#D49B35] text-white flex items-center justify-center backdrop-blur-xs shadow-lg transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Left Fashion Content */}
          <div className="relative z-10 pl-14 sm:pl-20 lg:pl-24 pr-14 sm:pr-16 py-10 max-w-2xl space-y-5">
            <div className="space-y-2.5">
              <p className="text-base sm:text-lg font-semibold text-white tracking-wide">
                {displayKicker}
              </p>
              <div className="inline-block px-3 py-1 rounded-md border border-[#B88A58]/45 bg-[#2B170A]/85 text-[#E5A93C] text-[11px] font-mono font-semibold tracking-wider uppercase">
                {displayBadge}
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-bold text-white leading-[1.1] tracking-tight whitespace-pre-line">
              {displayTitle}
            </h1>

            <p className="text-sm sm:text-base text-[#D6CFC7] font-normal max-w-xl leading-relaxed">
              {displaySubtitle}
            </p>

            <div className="pt-2">
              <button
                type="button"
                id="btn-hero-discover"
                onClick={onSeeDetails}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg bg-[#381E0E]/90 hover:bg-[#522B14] border border-[#B88A58]/45 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-4 h-4 text-[#E5A93C]" />
                <span>{isEs ? 'Ver detalles' : 'See details'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Pagination Dots */}
        <div className="flex items-center justify-center gap-2.5 pt-4">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'w-7 bg-[#D49B35]'
                    : 'w-2 bg-[#B88A58]/30 hover:bg-[#B88A58]/60'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Admin Upload & Per-Slide Text Manager Modal (Only accessible to luis.delarosacosio@gmail.com) */}
      {isAdminUser && isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14161D] border border-[#B88A58]/40 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C]">
                  10S ROTATION FRAME · ADMIN
                </span>
                <h3 className="text-lg font-semibold text-white mt-0.5">
                  {isEs
                    ? 'Subir Imágenes y Escribir Frases por Imagen'
                    : 'Upload Images & Write Sentences for Each Slide'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Selector Strip: Click any image to write/edit its own sentences */}
            <div className="bg-[#0C0E13] p-3 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#E5A93C]">
                  {isEs
                    ? '1. Selecciona una imagen para editar sus frases o agrega una nueva:'
                    : '1. Select an image to edit its sentences or add a new one:'}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
                {slides.map((s, idx) => {
                  const isSelectedForEdit = uploadMode === 'replace' && editingSlideIdx === idx;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSlideToEdit(idx)}
                      className={`group relative h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                        isSelectedForEdit
                          ? 'border-[#D49B35] ring-2 ring-[#D49B35]'
                          : 'border-white/15 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/45 flex items-end p-1.5">
                        <span className="text-[10px] font-mono text-white truncate">
                          #{idx + 1} {(isEs ? s.titleEs || s.title : s.title).replace('\n', ' ')}
                        </span>
                      </div>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(s.id, idx);
                          }}
                          className="absolute top-1 right-1 p-1 rounded bg-red-600/90 text-white opacity-80 hover:opacity-100 cursor-pointer"
                          title={isEs ? 'Eliminar diapositiva' : 'Delete slide'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode selector: Add new slide vs Edit selected slide */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#0C0E13] rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => handleSelectMode('add')}
                className={`py-2 px-3 rounded-md text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  uploadMode === 'add'
                    ? 'bg-[#D49B35] text-[#111111] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEs ? 'Subir Nueva Imagen' : 'Add New Image'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectMode('replace')}
                className={`py-2 px-3 rounded-md text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  uploadMode === 'replace'
                    ? 'bg-[#D49B35] text-[#111111] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>
                  {isEs
                    ? `Editar Imagen #${editingSlideIdx + 1}`
                    : `Edit Slide #${editingSlideIdx + 1}`}
                </span>
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                  {uploadMode === 'add'
                    ? isEs
                      ? 'Imagen para la Nueva Diapositiva'
                      : 'Image for New Slide'
                    : isEs
                    ? `Imagen de la Diapositiva #${editingSlideIdx + 1} (Opcional cambiarla)`
                    : `Image for Slide #${editingSlideIdx + 1} (Optional to change)`}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#D49B35]/60 bg-[#1C1610] hover:bg-[#261D14] text-[#E5A93C] text-xs font-mono uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>
                      {isUploadingFile
                        ? isEs
                          ? 'Optimizando...'
                          : 'Optimizing...'
                        : isEs
                        ? 'Seleccionar Imagen del Dispositivo'
                        : 'Choose Image from Device'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (e.target.value.trim()) setPreviewImage(e.target.value.trim());
                  }}
                  placeholder={isEs ? 'O pega una URL de imagen aquí...' : 'Or paste an image URL here...'}
                  className="mt-2 w-full px-3.5 py-2 rounded-lg bg-[#0C0E13] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D49B35]"
                />

                {previewImage && (
                  <div className="mt-2.5 relative h-32 rounded-xl overflow-hidden border border-[#B88A58]/40 bg-black">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[#E5A93C] text-[10px] font-mono">
                      {uploadMode === 'add'
                        ? isEs
                          ? 'Nueva Imagen'
                          : 'New Image'
                        : isEs
                        ? `Diapositiva #${editingSlideIdx + 1}`
                        : `Slide #${editingSlideIdx + 1}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Per-Image Custom Fashion Sentences */}
              <div className="bg-[#0C0E13] p-3.5 rounded-xl border border-[#B88A58]/30 space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#E5A93C]">
                  {uploadMode === 'add'
                    ? isEs
                      ? '2. Escribe las frases exclusivas para esta nueva imagen:'
                      : '2. Write the custom sentences for this new image:'
                    : isEs
                    ? `2. Escribe o edita las frases para la Imagen #${editingSlideIdx + 1}:`
                    : `2. Write or edit the sentences for Slide #${editingSlideIdx + 1}:`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                      {isEs ? 'Línea Superior (Ej. Atelier Central)' : 'Top Label (e.g. Central Atelier)'}
                    </label>
                    <input
                      type="text"
                      value={kickerInput}
                      onChange={(e) => setKickerInput(e.target.value)}
                      placeholder={isEs ? 'Ej. Casa de Alta Costura' : 'e.g. Haute Couture House'}
                      className="w-full px-3 py-2 rounded-lg bg-[#14161D] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D49B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                      {isEs ? 'Etiqueta (Ej. COLECCIÓN_MODA)' : 'Collection Badge (e.g. RUNWAY_26)'}
                    </label>
                    <input
                      type="text"
                      value={badgeInput}
                      onChange={(e) => setBadgeInput(e.target.value)}
                      placeholder={isEs ? 'Ej. EDICIÓN_EXCLUSIVA' : 'e.g. EXCLUSIVE_EDITION'}
                      className="w-full px-3 py-2 rounded-lg bg-[#14161D] border border-white/15 text-xs font-mono text-[#E5A93C] placeholder-white/30 focus:outline-none focus:border-[#D49B35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    {isEs ? 'Título Principal de esta Imagen' : 'Main Headline for this Image'}
                  </label>
                  <textarea
                    rows={2}
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder={
                      isEs
                        ? 'Escribe el título principal para esta imagen (ej. Elegancia en Seda y Lino)...'
                        : 'Write the main headline for this image (e.g. Silk & Linen Elegance)...'
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#14161D] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D49B35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                    {isEs ? 'Frase / Descripción Inferior' : 'Bottom Sentence / Subtitle'}
                  </label>
                  <input
                    type="text"
                    value={subtitleInput}
                    onChange={(e) => setSubtitleInput(e.target.value)}
                    placeholder={
                      isEs
                        ? 'Escribe la frase descriptiva para esta imagen...'
                        : 'Write the descriptive sentence for this image...'
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#14161D] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D49B35]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/15 text-xs text-white/80 hover:text-white cursor-pointer"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!previewImage && !imageUrlInput.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#D49B35] to-[#E8B647] disabled:opacity-40 text-[#111111] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {uploadMode === 'add'
                      ? isEs
                        ? 'Agregar Imagen y Frases'
                        : 'Add Image & Sentences'
                      : isEs
                      ? `Guardar Cambios (#${editingSlideIdx + 1})`
                      : `Save Slide #${editingSlideIdx + 1}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
