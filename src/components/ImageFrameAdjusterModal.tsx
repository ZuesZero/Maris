import React, { useState, useRef, useEffect } from 'react';
import { Product, ImageFrameSettings, User } from '../types';
import {
  DEFAULT_IMAGE_FRAME_SETTINGS,
  HAT_CENTERED_PRESET,
  LUXURY_FULL_BLEED_PRESET,
  getStoredImageSettings,
  saveStoredImageSettings
} from '../utils/imageFrame';
import {
  Sliders,
  X,
  Check,
  RefreshCw,
  ShieldCheck,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  Scissors,
  Crop,
  Undo2
} from 'lucide-react';
import { Language } from '../data/translations';

interface ImageFrameAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onUpdateProduct?: (updatedProduct: Product) => void;
  currentUser?: User | null;
  language?: Language;
  onSwitchUserToLuis?: () => void;
}

type DragEdge = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

export const ImageFrameAdjusterModal: React.FC<ImageFrameAdjusterModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdateProduct,
  language = 'en',
}) => {
  const isEs = language === 'es';

  const [settings, setSettings] = useState<ImageFrameSettings>(() => {
    const initial = product.imageFrameSettings || getStoredImageSettings(product.id) || DEFAULT_IMAGE_FRAME_SETTINGS;
    return {
      ...DEFAULT_IMAGE_FRAME_SETTINGS,
      ...initial
    };
  });

  const [workingImages, setWorkingImages] = useState<string[]>(() => [...(product.images || [])]);
  const [originalImagesBackup] = useState<string[]>(() => [...(product.images || [])]);
  const [hasAppliedCanvasCut, setHasAppliedCanvasCut] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCutModeActive, setIsCutModeActive] = useState(false);
  const [isCuttingImage, setIsCuttingImage] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const activeDragEdgeRef = useRef<DragEdge>(null);

  useEffect(() => {
    if (isOpen) {
      const initial = product.imageFrameSettings || getStoredImageSettings(product.id) || DEFAULT_IMAGE_FRAME_SETTINGS;
      setSettings({
        ...DEFAULT_IMAGE_FRAME_SETTINGS,
        ...initial
      });
      setWorkingImages([...(product.images || [])]);
      setHasAppliedCanvasCut(false);
    }
  }, [isOpen, product]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Interactive pointer drag for Cut Mode handles on Live Preview
  useEffect(() => {
    if (!isCutModeActive) return;

    const handlePointerMove = (e: PointerEvent) => {
      const edge = activeDragEdgeRef.current;
      const box = previewContainerRef.current;
      if (!edge || !box) return;

      const rect = box.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const relX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const relY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      setSettings((prev) => {
        let nextTop = prev.cropTop ?? 0;
        let nextBottom = prev.cropBottom ?? 0;
        let nextLeft = prev.cropLeft ?? 0;
        let nextRight = prev.cropRight ?? 0;

        if (edge.includes('top')) {
          nextTop = Math.round(Math.max(0, Math.min(45, relY)));
        }
        if (edge.includes('bottom')) {
          nextBottom = Math.round(Math.max(0, Math.min(45, 100 - relY)));
        }
        if (edge.includes('left')) {
          nextLeft = Math.round(Math.max(0, Math.min(45, relX)));
        }
        if (edge.includes('right')) {
          nextRight = Math.round(Math.max(0, Math.min(45, 100 - relX)));
        }

        return {
          ...prev,
          cropTop: nextTop,
          cropBottom: nextBottom,
          cropLeft: nextLeft,
          cropRight: nextRight
        };
      });
    };

    const handlePointerUp = () => {
      activeDragEdgeRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isCutModeActive]);

  if (!isOpen) return null;

  const currentImageSrc = workingImages[selectedImageIndex] || workingImages[0] || product.images[0];

  const rotationDeg = settings.rotation ?? 0;
  const flipX = settings.mirrorX ? -1 : 1;
  const flipY = settings.mirrorY ? -1 : 1;
  const cropT = Math.max(0, Math.min(45, settings.cropTop ?? 0));
  const cropR = Math.max(0, Math.min(45, settings.cropRight ?? 0));
  const cropB = Math.max(0, Math.min(45, settings.cropBottom ?? 0));
  const cropL = Math.max(0, Math.min(45, settings.cropLeft ?? 0));
  const hasActiveCrop = cropT > 0 || cropR > 0 || cropB > 0 || cropL > 0;

  const handleApplyPreset = (preset: ImageFrameSettings) => {
    setSettings({
      ...DEFAULT_IMAGE_FRAME_SETTINGS,
      ...preset,
      rotation: settings.rotation ?? 0,
      mirrorX: settings.mirrorX ?? false,
      mirrorY: settings.mirrorY ?? false,
      cropTop: settings.cropTop ?? 0,
      cropRight: settings.cropRight ?? 0,
      cropBottom: settings.cropBottom ?? 0,
      cropLeft: settings.cropLeft ?? 0
    });
  };

  const handleSelectRotation = (angle: number) => {
    setSettings((prev) => ({
      ...prev,
      rotation: angle
    }));
  };

  const handleStepRotate90 = () => {
    setSettings((prev) => {
      const current = prev.rotation ?? 0;
      const next = current === 90 ? 180 : current === 180 ? 270 : current === 270 ? 360 : 90;
      return { ...prev, rotation: next };
    });
  };

  const handleToggleMirrorX = () => {
    setSettings((prev) => ({ ...prev, mirrorX: !prev.mirrorX }));
  };

  const handleToggleMirrorY = () => {
    setSettings((prev) => ({ ...prev, mirrorY: !prev.mirrorY }));
  };

  const handleApplyCutToImage = async () => {
    if (!currentImageSrc) return;
    setIsCuttingImage(true);
    try {
      const img = new Image();
      if (!currentImageSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = currentImageSrc;
      });

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      const sx = Math.round((cropL / 100) * srcW);
      const sy = Math.round((cropT / 100) * srcH);
      const sw = Math.max(20, Math.round(((100 - cropL - cropR) / 100) * srcW));
      const sh = Math.max(20, Math.round(((100 - cropT - cropB) / 100) * srcH));

      const canvas = document.createElement('canvas');
      const maxDim = 1100;
      const scale = Math.min(1, maxDim / Math.max(sw, sh));
      canvas.width = Math.max(1, Math.round(sw * scale));
      canvas.height = Math.max(1, Math.round(sh * scale));

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setWorkingImages((prev) =>
          prev.map((item, idx) => (idx === selectedImageIndex ? croppedDataUrl : item))
        );
        setHasAppliedCanvasCut(true);
        setSettings((prev) => ({
          ...prev,
          cropTop: 0,
          cropRight: 0,
          cropBottom: 0,
          cropLeft: 0,
          fit: 'cover'
        }));
        setIsCutModeActive(false);
      }
    } catch (err) {
      console.warn('Using non-destructive frame cut for external image:', err);
      setIsCutModeActive(false);
    } finally {
      setIsCuttingImage(false);
    }
  };

  const handleRestoreUncutImage = () => {
    setWorkingImages([...originalImagesBackup]);
    setHasAppliedCanvasCut(false);
    setSettings((prev) => ({
      ...prev,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0
    }));
  };

  const handleSaveSettings = (isGlobal = false) => {
    saveStoredImageSettings(product.id, settings, isGlobal);

    const updatedProduct: Product = {
      ...product,
      images: workingImages,
      imageFrameSettings: settings
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const previewTransforms: string[] = [`scale(${(settings.zoom ?? 100) / 100})`];
  if (rotationDeg !== 0) {
    previewTransforms.push(`rotate(${rotationDeg}deg)`);
  }
  if (flipX !== 1 || flipY !== 1) {
    previewTransforms.push(`scale(${flipX}, ${flipY})`);
  }
  const useCenterOrigin = rotationDeg !== 0 || flipX !== 1 || flipY !== 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[96vh]">
        {/* Compact Header */}
        <div className="bg-[#1C1B20] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#333] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#B88A58] text-white rounded-md">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-medium text-sm tracking-wide">
                {isEs ? 'Ajustar Marco, Rotación, Espejo y Corte' : 'Adjust Frame, Rotation, Mirror & Cut'}
              </h3>
              <span className="text-xs text-[#B88A58] font-medium">• {product.name}</span>
              <span className="text-[10px] font-mono bg-[#B88A58]/25 text-[#DED3C4] border border-[#B88A58]/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#B88A58]" />
                luis.delarosacosio@gmail.com
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* All-in-One-Shot Studio Body (Left: Preview + Presets | Right: All Controls) */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* LEFT COLUMN (4 cols): Live Frame Preview + Quick Presets */}
            <div className="lg:col-span-4 bg-white p-3 rounded-md border border-[#E8E2D9] shadow-xs flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C9083]">
                    {isEs ? 'Vista Previa en Vivo' : 'Live Frame Preview'}
                  </span>
                  <span className="text-[10px] font-mono text-[#B88A58] font-bold">
                    {rotationDeg ? `${rotationDeg}° ` : ''}
                    {settings.mirrorX ? '↔ ' : ''}
                    {settings.mirrorY ? '↕ ' : ''}
                    {hasActiveCrop ? '✂' : ''}
                  </span>
                </div>

                {/* Preview Viewport */}
                <div
                  ref={previewContainerRef}
                  className="w-full aspect-[4/5] max-w-[205px] rounded-sm overflow-hidden border border-[#D1C9BD] shadow-inner relative transition-all duration-300 select-none"
                  style={{
                    backgroundColor: settings.backgroundColor,
                    padding: `${settings.padding}px`
                  }}
                >
                  <img
                    src={currentImageSrc}
                    alt="Preview"
                    className="w-full h-full transition-all duration-200 pointer-events-none select-none"
                    style={{
                      objectFit: settings.fit,
                      objectPosition: `${settings.positionX}% ${settings.positionY}%`,
                      transform: previewTransforms.join(' '),
                      transformOrigin: useCenterOrigin ? '50% 50%' : `${settings.positionX}% ${settings.positionY}%`,
                      clipPath: !isCutModeActive && hasActiveCrop
                        ? `inset(${cropT}% ${cropR}% ${cropB}% ${cropL}%)`
                        : undefined
                    }}
                  />

                  {/* Interactive Cut / Crop Overlay Box */}
                  {isCutModeActive && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="absolute inset-x-0 top-0 bg-black/50" style={{ height: `${cropT}%` }} />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50" style={{ height: `${cropB}%` }} />
                      <div
                        className="absolute left-0 bg-black/50"
                        style={{ top: `${cropT}%`, bottom: `${cropB}%`, width: `${cropL}%` }}
                      />
                      <div
                        className="absolute right-0 bg-black/50"
                        style={{ top: `${cropT}%`, bottom: `${cropB}%`, width: `${cropR}%` }}
                      />

                      <div
                        className="absolute border-2 border-dashed border-[#D49B35] shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                        style={{
                          top: `${cropT}%`,
                          right: `${cropR}%`,
                          bottom: `${cropB}%`,
                          left: `${cropL}%`
                        }}
                      >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                          <div className="border-r border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-b border-white/30" />
                          <div className="border-r border-white/30" />
                          <div className="border-r border-white/30" />
                          <div />
                        </div>

                        {/* Edge Handles */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'top';
                          }}
                          className="pointer-events-auto absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-[#D49B35] border border-[#1C1B20] rounded-full cursor-ns-resize"
                        />
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'bottom';
                          }}
                          className="pointer-events-auto absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-[#D49B35] border border-[#1C1B20] rounded-full cursor-ns-resize"
                        />
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'left';
                          }}
                          className="pointer-events-auto absolute top-1/2 -left-2 -translate-y-1/2 w-2.5 h-7 bg-[#D49B35] border border-[#1C1B20] rounded-full cursor-ew-resize"
                        />
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'right';
                          }}
                          className="pointer-events-auto absolute top-1/2 -right-2 -translate-y-1/2 w-2.5 h-7 bg-[#D49B35] border border-[#1C1B20] rounded-full cursor-ew-resize"
                        />

                        {/* Corner Handles */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'top-left';
                          }}
                          className="pointer-events-auto absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1C1B20] rounded-xs cursor-nwse-resize"
                        />
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'top-right';
                          }}
                          className="pointer-events-auto absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1C1B20] rounded-xs cursor-nesw-resize"
                        />
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'bottom-left';
                          }}
                          className="pointer-events-auto absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1C1B20] rounded-xs cursor-nesw-resize"
                        />
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            activeDragEdgeRef.current = 'bottom-right';
                          }}
                          className="pointer-events-auto absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1C1B20] rounded-xs cursor-nwse-resize"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Multi-image thumbnails */}
                {workingImages.length > 1 && (
                  <div className="flex gap-1.5 mt-2">
                    {workingImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-6 h-8 rounded-xs overflow-hidden border transition-all cursor-pointer ${
                          selectedImageIndex === idx ? 'border-[#1C1B20] ring-1 ring-[#1C1B20]' : 'opacity-60 border-transparent'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Compact Quick Presets under Preview */}
              <div className="mt-3 pt-2.5 border-t border-[#E8E2D9] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {isEs ? 'Ajustes Rápidos (Presets)' : 'Quick Presets'}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(HAT_CENTERED_PRESET)}
                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#E8E2D9] rounded-xs text-[10px] text-center font-semibold text-[#1C1B20] transition-colors cursor-pointer"
                    title="Contain • Center 50% • Padding 12px"
                  >
                    🎩 {isEs ? 'Accesorio' : 'Accessory'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(LUXURY_FULL_BLEED_PRESET)}
                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#E8E2D9] rounded-xs text-[10px] text-center font-semibold text-[#1C1B20] transition-colors cursor-pointer"
                    title="Cover • Top 0% • Padding 0px"
                  >
                    🧥 {isEs ? 'Prenda' : 'Full Bleed'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset({ ...HAT_CENTERED_PRESET, zoom: 115, padding: 0 })}
                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#E8E2D9] rounded-xs text-[10px] text-center font-semibold text-[#1C1B20] transition-colors cursor-pointer"
                    title="Contain • Zoom 115%"
                  >
                    🔍 {isEs ? 'Zoom 115%' : 'Zoom 115%'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (8 cols): All Picture Modification Controls in One Shot */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-3">
              {/* 1. ROTATION (90°, 180°, 270°, 360°) & MIRROR OPTION */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-md border border-[#E8E2D9] shadow-xs">
                {/* Image Rotation (7 cols) */}
                <div className="sm:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-[#B88A58]" />
                      {isEs ? 'Rotación de Imagen' : 'Image Rotation'}
                    </span>
                    <button
                      type="button"
                      onClick={handleStepRotate90}
                      className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F0EA] hover:bg-[#1C1B20] hover:text-white text-[#1C1B20] border border-[#D1C9BD] rounded-xs transition-colors cursor-pointer"
                    >
                      {isEs ? 'Girar +90°' : 'Turn +90°'}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[90, 180, 270, 360].map((deg) => {
                      const isActive = rotationDeg === deg;
                      return (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => handleSelectRotation(deg)}
                          className={`py-1.5 px-2 text-xs font-mono font-bold rounded-xs border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-[#1C1B20] text-[#FAF8F5] border-[#B88A58] ring-1 ring-[#B88A58]'
                              : 'bg-[#FAF8F5] hover:bg-[#F4F0EA] text-[#1C1B20] border-[#D1C9BD]'
                          }`}
                        >
                          <RotateCw
                            className={`w-3 h-3 ${isActive ? 'text-[#D49B35]' : 'text-[#8C9083]'}`}
                            style={{ transform: `rotate(${deg}deg)` }}
                          />
                          <span>{deg}°</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mirror Option (5 cols) */}
                <div className="sm:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1">
                      <FlipHorizontal2 className="w-3.5 h-3.5 text-[#B88A58]" />
                      {isEs ? 'Opción Espejo' : 'Mirror Option'}
                    </span>
                    {(settings.mirrorX || settings.mirrorY) && (
                      <button
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, mirrorX: false, mirrorY: false }))}
                        className="text-[9px] font-mono text-[#B88A58] hover:underline cursor-pointer"
                      >
                        {isEs ? 'Reset' : 'Reset'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleMirrorX}
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-xs border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        settings.mirrorX
                          ? 'bg-[#1C1B20] text-[#FAF8F5] border-[#B88A58] ring-1 ring-[#B88A58]'
                          : 'bg-[#FAF8F5] hover:bg-[#F4F0EA] text-[#1C1B20] border-[#D1C9BD]'
                      }`}
                    >
                      <FlipHorizontal2 className={`w-3.5 h-3.5 ${settings.mirrorX ? 'text-[#D49B35]' : 'text-[#8C9083]'}`} />
                      <span>{isEs ? 'Horizontal' : 'Horizontal'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMirrorY}
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-xs border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        settings.mirrorY
                          ? 'bg-[#1C1B20] text-[#FAF8F5] border-[#B88A58] ring-1 ring-[#B88A58]'
                          : 'bg-[#FAF8F5] hover:bg-[#F4F0EA] text-[#1C1B20] border-[#D1C9BD]'
                      }`}
                    >
                      <FlipVertical2 className={`w-3.5 h-3.5 ${settings.mirrorY ? 'text-[#D49B35]' : 'text-[#8C9083]'}`} />
                      <span>{isEs ? 'Vertical' : 'Vertical'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. CUT IMAGE TO ADJUST (CROP / TRIM CONTROLS) */}
              <div className="bg-white p-3 rounded-md border border-[#E8E2D9] shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#B88A58]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20]">
                      {isEs ? 'Cortar Imagen para Ajustar (Cut Image)' : 'Cut Image to Adjust'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCutModeActive(true);
                        setSettings((prev) => ({ ...prev, cropTop: 8, cropBottom: 8, cropLeft: 8, cropRight: 8 }));
                      }}
                      className="px-2 py-1 text-[10px] font-mono bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#D1C9BD] rounded-xs cursor-pointer"
                    >
                      {isEs ? 'Bordes 8%' : 'Trim 8%'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCutModeActive(true);
                        setSettings((prev) => ({ ...prev, cropTop: 15, cropBottom: 15, cropLeft: 0, cropRight: 0 }));
                      }}
                      className="px-2 py-1 text-[10px] font-mono bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#D1C9BD] rounded-xs cursor-pointer"
                    >
                      {isEs ? 'Cuadrado 15%' : 'Square 15%'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCutModeActive((prev) => !prev)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-xs border transition-all flex items-center gap-1 cursor-pointer ${
                        isCutModeActive
                          ? 'bg-[#B88A58] text-white border-[#B88A58]'
                          : 'bg-[#FAF8F5] hover:bg-[#1C1B20] hover:text-white text-[#1C1B20] border-[#D1C9BD]'
                      }`}
                    >
                      <Crop className="w-3 h-3" />
                      <span>
                        {isCutModeActive
                          ? isEs ? 'Ocultar Caja' : 'Hide Cut Box'
                          : isEs ? 'Caja de Corte' : 'Cut Box'}
                      </span>
                    </button>

                    {hasActiveCrop && (
                      <button
                        type="button"
                        disabled={isCuttingImage}
                        onClick={handleApplyCutToImage}
                        className="px-2.5 py-1 bg-[#1C1B20] hover:bg-[#B88A58] text-white text-[10px] font-semibold rounded-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Scissors className="w-3 h-3 text-[#D49B35]" />
                        <span>
                          {isCuttingImage
                            ? isEs ? 'Cortando...' : 'Cutting...'
                            : isEs ? 'Cortar Ahora' : 'Apply Cut'}
                        </span>
                      </button>
                    )}

                    {(hasActiveCrop || hasAppliedCanvasCut) && (
                      <button
                        type="button"
                        onClick={handleRestoreUncutImage}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-mono rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>{isEs ? 'Restaurar' : 'Undo Cut'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Edge Cut Sliders in One Compact Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Arriba' : 'Cut Top'}</span>
                      <span className="font-mono text-[#B88A58]">{cropT}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={cropT}
                      onChange={(e) => setSettings({ ...settings, cropTop: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Abajo' : 'Cut Bottom'}</span>
                      <span className="font-mono text-[#B88A58]">{cropB}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={cropB}
                      onChange={(e) => setSettings({ ...settings, cropBottom: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Izquierda' : 'Cut Left'}</span>
                      <span className="font-mono text-[#B88A58]">{cropL}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={cropL}
                      onChange={(e) => setSettings({ ...settings, cropLeft: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Derecha' : 'Cut Right'}</span>
                      <span className="font-mono text-[#B88A58]">{cropR}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={cropR}
                      onChange={(e) => setSettings({ ...settings, cropRight: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3. MANUAL FRAME ADJUSTMENT CONTROLS (FIT, COLOR, ZOOM, PADDING, POS X/Y) */}
              <div className="bg-white p-3 rounded-md border border-[#E8E2D9] shadow-xs space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {isEs ? 'Ajuste de Marco, Posición y Escala' : 'Frame Fit, Position & Zoom Controls'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                  {/* Fit Mode */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Modo (Object Fit)' : 'Image Fit Mode'}
                    </label>
                    <select
                      value={settings.fit}
                      onChange={(e) => setSettings({ ...settings, fit: e.target.value as any })}
                      className="w-full text-[11px] px-2 py-1.5 border border-[#D1C9BD] bg-white rounded-xs focus:outline-none focus:border-[#B88A58] font-medium"
                    >
                      <option value="contain">{isEs ? 'Contain (Completa)' : 'Contain (Full)'}</option>
                      <option value="cover">{isEs ? 'Cover (Llenar)' : 'Cover (Fill)'}</option>
                      <option value="fill">{isEs ? 'Fill (Estirar)' : 'Fill (Stretch)'}</option>
                      <option value="scale-down">Scale-down</option>
                    </select>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Color de Fondo' : 'Canvas Color'}
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        { label: 'Sand', hex: '#F4F0EA' },
                        { label: 'White', hex: '#FFFFFF' },
                        { label: 'Cream', hex: '#FAF8F5' },
                        { label: 'Gray', hex: '#E8E2D9' },
                        { label: 'Dark', hex: '#1C1B20' }
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setSettings({ ...settings, backgroundColor: c.hex })}
                          className={`w-6 h-6 rounded-xs border transition-all cursor-pointer ${
                            settings.backgroundColor === c.hex ? 'ring-2 ring-[#B88A58] border-[#1C1B20]' : 'border-[#D1C9BD]'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Zoom Scale */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Zoom / Escala' : 'Image Zoom'}</span>
                      <span className="font-mono text-[#B88A58]">{settings.zoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="5"
                      value={settings.zoom}
                      onChange={(e) => setSettings({ ...settings, zoom: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>

                  {/* Horizontal Position X */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Posición X (Izq/Der)' : 'Position X (L/R)'}</span>
                      <span className="font-mono text-[#B88A58]">{settings.positionX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.positionX}
                      onChange={(e) => setSettings({ ...settings, positionX: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>

                  {/* Vertical Position Y */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Posición Y (Arr/Aba)' : 'Position Y (T/B)'}</span>
                      <span className="font-mono text-[#B88A58]">{settings.positionY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.positionY}
                      onChange={(e) => setSettings({ ...settings, positionY: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>

                  {/* Frame Inner Padding */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-[#55524B]">
                      <span>{isEs ? 'Margen (Padding)' : 'Frame Padding'}</span>
                      <span className="font-mono text-[#B88A58]">{settings.padding}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={settings.padding}
                      onChange={(e) => setSettings({ ...settings, padding: Number(e.target.value) })}
                      className="w-full h-1.5 accent-[#B88A58] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer Actions */}
        <div className="px-4 py-2.5 bg-[#F4F0EA] border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSettings(DEFAULT_IMAGE_FRAME_SETTINGS);
              setIsCutModeActive(false);
            }}
            className="text-xs text-[#55524B] hover:text-[#1C1B20] font-mono flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restablecer Todo' : 'Reset Standard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveSettings(true)}
              className="px-3 py-1.5 bg-white border border-[#D1C9BD] hover:border-[#1C1B20] text-[#1C1B20] text-xs font-semibold rounded-sm transition-all cursor-pointer"
            >
              {isEs ? 'Aplicar a Todos los Productos' : 'Apply to All Products'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveSettings(false)}
              className="px-4 py-1.5 bg-[#1C1B20] hover:bg-[#B88A58] text-white text-xs font-semibold tracking-wider uppercase rounded-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isEs ? 'Guardado' : 'Saved'}</span>
                </>
              ) : (
                <span>{isEs ? 'Guardar en Este Producto' : 'Save for This Product'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
