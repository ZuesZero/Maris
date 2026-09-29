import React, { useState } from 'react';
import { Product, ImageFrameSettings, User } from '../types';
import { DEFAULT_IMAGE_FRAME_SETTINGS, HAT_CENTERED_PRESET, LUXURY_FULL_BLEED_PRESET, saveStoredImageSettings } from '../utils/imageFrame';
import { Sliders, X, Check, RefreshCw, ZoomIn, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
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

export const ImageFrameAdjusterModal: React.FC<ImageFrameAdjusterModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdateProduct,
  currentUser,
  language = 'en',
  onSwitchUserToLuis
}) => {
  const isLuisUser = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';

  const [settings, setSettings] = useState<ImageFrameSettings>(() => {
    return product.imageFrameSettings || DEFAULT_IMAGE_FRAME_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const handleApplyPreset = (preset: ImageFrameSettings) => {
    setSettings(preset);
  };

  const handleSaveSettings = (isGlobal = false) => {
    saveStoredImageSettings(product.id, settings, isGlobal);

    const updatedProduct: Product = {
      ...product,
      imageFrameSettings: settings
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const currentImageSrc = product.images[selectedImageIndex] || product.images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1C1B20] text-white p-4 flex items-center justify-between border-b border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#B88A58] text-white rounded-md">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-medium text-sm tracking-wide">
                  {language === 'es' ? 'Herramienta de Encuadre de Imagen' : 'Picture Size & Frame Adjuster'}
                </h3>
                <span className="text-[10px] font-mono bg-[#B88A58]/30 text-[#DED3C4] border border-[#B88A58]/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#B88A58]" />
                  luis.delarosacosio@gmail.com
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Validation Banner */}
        {!isLuisUser && (
          <div className="bg-[#FAF0E6] border-b border-[#E8D0B8] p-3 flex items-center justify-between text-xs text-[#553C26]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88A58] shrink-0" />
              <span>
                {language === 'es'
                  ? 'Estás probando la herramienta asignada a luis.delarosacosio@gmail.com.'
                  : 'You are using the image frame tool enabled for luis.delarosacosio@gmail.com.'}
              </span>
            </div>
            {onSwitchUserToLuis && (
              <button
                onClick={onSwitchUserToLuis}
                className="font-bold text-[11px] underline text-[#1C1B20] hover:text-[#B88A58] cursor-pointer"
              >
                {language === 'es' ? 'Activar como Luis' : 'Switch to Luis Account'}
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Main Interactive Live Preview Area */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-white p-4 rounded-md border border-[#E8E2D9] shadow-xs">
            {/* Live Frame Box */}
            <div className="sm:col-span-6 flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C9083] mb-2">
                {language === 'es' ? 'Vista Previa en Vivo' : 'Live Frame Preview'}
              </span>
              <div
                className="w-full aspect-[4/5] max-w-[220px] rounded-sm overflow-hidden border border-[#D1C9BD] shadow-inner relative transition-all duration-300"
                style={{
                  backgroundColor: settings.backgroundColor,
                  padding: `${settings.padding}px`
                }}
              >
                <img
                  src={currentImageSrc}
                  alt="Preview"
                  className="w-full h-full transition-all duration-200"
                  style={{
                    objectFit: settings.fit,
                    objectPosition: `${settings.positionX}% ${settings.positionY}%`,
                    transform: `scale(${settings.zoom / 100})`,
                    transformOrigin: `${settings.positionX}% ${settings.positionY}%`
                  }}
                />
              </div>

              {/* Angle selector if multiple images */}
              {product.images.length > 1 && (
                <div className="flex gap-1.5 mt-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-7 h-9 rounded-xs overflow-hidden border transition-all ${
                        selectedImageIndex === idx ? 'border-[#1C1B20] ring-1 ring-[#1C1B20]' : 'opacity-60 border-transparent'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="sm:col-span-6 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                {language === 'es' ? 'Ajustes Rápidos (Presets)' : 'Quick Presets'}
              </span>

              <button
                type="button"
                onClick={() => handleApplyPreset(HAT_CENTERED_PRESET)}
                className="w-full text-left p-2.5 bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-[#1C1B20]">🎩 {language === 'es' ? 'Sombreros y Accesorios' : 'Hats & Accessories'}</div>
                  <div className="text-[10px] text-[#8C9083]">Contain • Centrado (50%) • Margen 12px</div>
                </div>
                <Maximize2 className="w-3.5 h-3.5 text-[#B88A58] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(LUXURY_FULL_BLEED_PRESET)}
                className="w-full text-left p-2.5 bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-[#1C1B20]">🧥 {language === 'es' ? 'Prenda Completa (Cover Superior)' : 'Full Apparel (Cover Top)'}</div>
                  <div className="text-[10px] text-[#8C9083]">Cover • Posición 0% Superior • Sin Margen</div>
                </div>
                <Maximize2 className="w-3.5 h-3.5 text-[#B88A58] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset({ ...HAT_CENTERED_PRESET, zoom: 115, padding: 0 })}
                className="w-full text-left p-2.5 bg-[#FAF8F5] hover:bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-[#1C1B20]">🔍 {language === 'es' ? 'Zoom Detalle (115%)' : 'Detail Zoom (115%)'}</div>
                  <div className="text-[10px] text-[#8C9083]">Contain • Zoom 115% • Centrado</div>
                </div>
                <ZoomIn className="w-3.5 h-3.5 text-[#B88A58] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Controls Sliders & Dropdowns */}
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block border-b border-[#E8E2D9] pb-1">
              {language === 'es' ? 'Controles Manuales de Ajuste' : 'Manual Frame Adjustment Controls'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fit Mode */}
              <div>
                <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                  {language === 'es' ? 'Modo de Ajuste (Object Fit)' : 'Image Fit Mode'}
                </label>
                <select
                  value={settings.fit}
                  onChange={(e) => setSettings({ ...settings, fit: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58] font-medium"
                >
                  <option value="contain">{language === 'es' ? 'Contain (Ajustar Imagen Completa sin Cortar)' : 'Contain (Show Entire Picture)'}</option>
                  <option value="cover">{language === 'es' ? 'Cover (Llenar Marco Copiando Bordes)' : 'Cover (Fill Frame)'}</option>
                  <option value="fill">{language === 'es' ? 'Fill (Estirar al Marco)' : 'Fill (Stretch to Frame)'}</option>
                  <option value="scale-down">{language === 'es' ? 'Scale-down (Reducir Si es Grande)' : 'Scale-down'}</option>
                </select>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                  {language === 'es' ? 'Color de Fondo del Marco' : 'Frame Canvas Color'}
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'Sand', hex: '#F4F0EA' },
                    { label: 'White', hex: '#FFFFFF' },
                    { label: 'Cream', hex: '#FAF8F5' },
                    { label: 'Warm Gray', hex: '#E8E2D9' },
                    { label: 'Dark', hex: '#1C1B20' }
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSettings({ ...settings, backgroundColor: c.hex })}
                      className={`w-7 h-7 rounded-sm border transition-all ${
                        settings.backgroundColor === c.hex ? 'ring-2 ring-[#B88A58] border-[#1C1B20]' : 'border-[#D1C9BD]'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Vertical Position Y */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#55524B] mb-1">
                  <span>{language === 'es' ? 'Posición Vertical (Eje Y)' : 'Vertical Position (Y-Axis)'}</span>
                  <span className="font-mono text-[#B88A58]">{settings.positionY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.positionY}
                  onChange={(e) => setSettings({ ...settings, positionY: Number(e.target.value) })}
                  className="w-full accent-[#B88A58] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#8C9083] font-mono mt-0.5">
                  <span>0% ({language === 'es' ? 'Arriba' : 'Top'})</span>
                  <span>50% ({language === 'es' ? 'Centro' : 'Center'})</span>
                  <span>100% ({language === 'es' ? 'Abajo' : 'Bottom'})</span>
                </div>
              </div>

              {/* Horizontal Position X */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#55524B] mb-1">
                  <span>{language === 'es' ? 'Posición Horizontal (Eje X)' : 'Horizontal Position (X-Axis)'}</span>
                  <span className="font-mono text-[#B88A58]">{settings.positionX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.positionX}
                  onChange={(e) => setSettings({ ...settings, positionX: Number(e.target.value) })}
                  className="w-full accent-[#B88A58] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#8C9083] font-mono mt-0.5">
                  <span>0% ({language === 'es' ? 'Izquierda' : 'Left'})</span>
                  <span>50% ({language === 'es' ? 'Centro' : 'Center'})</span>
                  <span>100% ({language === 'es' ? 'Derecha' : 'Right'})</span>
                </div>
              </div>

              {/* Zoom Scale */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#55524B] mb-1">
                  <span>{language === 'es' ? 'Escala / Zoom de la Imagen' : 'Image Zoom / Scale'}</span>
                  <span className="font-mono text-[#B88A58]">{settings.zoom}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={settings.zoom}
                  onChange={(e) => setSettings({ ...settings, zoom: Number(e.target.value) })}
                  className="w-full accent-[#B88A58] cursor-pointer"
                />
              </div>

              {/* Frame Inner Padding */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#55524B] mb-1">
                  <span>{language === 'es' ? 'Margen del Marco (Padding)' : 'Frame Inner Padding'}</span>
                  <span className="font-mono text-[#B88A58]">{settings.padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.padding}
                  onChange={(e) => setSettings({ ...settings, padding: Number(e.target.value) })}
                  className="w-full accent-[#B88A58] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F4F0EA] border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSettings(DEFAULT_IMAGE_FRAME_SETTINGS)}
            className="text-xs text-[#55524B] hover:text-[#1C1B20] font-mono flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Restablecer' : 'Reset Standard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveSettings(true)}
              className="px-3 py-2 bg-white border border-[#D1C9BD] hover:border-[#1C1B20] text-[#1C1B20] text-xs font-semibold rounded-sm transition-all cursor-pointer"
            >
              {language === 'es' ? 'Aplicar a Todos los Productos' : 'Apply to All Products'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveSettings(false)}
              className="px-4 py-2 bg-[#1C1B20] hover:bg-[#B88A58] text-white text-xs font-semibold tracking-wider uppercase rounded-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'es' ? 'Guardado' : 'Saved'}</span>
                </>
              ) : (
                <span>{language === 'es' ? 'Guardar en Este Producto' : 'Save for This Product'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
