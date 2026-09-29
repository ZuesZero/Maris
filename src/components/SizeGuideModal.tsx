import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');

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

  const measurements = [
    { size: 'EU 46 (XS/S)', chestCm: '92-96', chestIn: '36-38', waistCm: '78-82', waistIn: '30-32', sleeveCm: '63', sleeveIn: '24.8' },
    { size: 'EU 48 (S/M)', chestCm: '96-100', chestIn: '38-40', waistCm: '82-86', waistIn: '32-34', sleeveCm: '64', sleeveIn: '25.2' },
    { size: 'EU 50 (M/L)', chestCm: '100-104', chestIn: '40-42', waistCm: '86-90', waistIn: '34-36', sleeveCm: '65', sleeveIn: '25.6' },
    { size: 'EU 52 (L/XL)', chestCm: '104-108', chestIn: '42-44', waistCm: '90-94', waistIn: '36-38', sleeveCm: '66', sleeveIn: '26.0' },
    { size: 'EU 54 (XL/XXL)', chestCm: '108-112', chestIn: '44-46', waistCm: '94-98', waistIn: '38-40', sleeveCm: '67', sleeveIn: '26.4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B20]/80 backdrop-blur-md p-4 transition-all animate-fadeIn">
      <div className="max-w-2xl w-full bg-[#FBF9F5] rounded-sm shadow-2xl border border-[#E8E2D9] p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8C9083] hover:text-[#1A1A1A] p-2 transition-colors"
          aria-label="Close Size Guide"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-2 border-b border-[#E8E2D9] pb-4">
          <div className="flex items-center gap-2 text-[#B88A58] text-xs font-semibold uppercase tracking-widest">
            <Ruler className="w-4 h-4" />
            <span>Bespoke Fit Guide</span>
          </div>
          <h3 className="font-serif text-3xl font-light text-[#1A1A1A]">
            Garment Measurements & Tailoring
          </h3>
          <p className="text-xs text-[#666562]">
            Mari's garments are cut according to classic Italian tailoring standards. Our outerwear features a sculpted shoulder with relaxed chest volume.
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex bg-[#F4F0EA] border border-[#E8E2D9] p-1 rounded-xs text-xs font-mono">
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-xs transition-colors ${unit === 'cm' ? 'bg-[#1C1B20] text-white font-bold' : 'text-[#666562]'}`}
            >
              Metric (cm)
            </button>
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-xs transition-colors ${unit === 'inches' ? 'bg-[#1C1B20] text-white font-bold' : 'text-[#666562]'}`}
            >
              Imperial (in)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E8E2D9] rounded-sm">
          <table className="w-full text-xs text-left text-[#1A1A1A]">
            <thead className="bg-[#1C1B20] text-[#F4F0EA] uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Size (EU)</th>
                <th className="py-3 px-4">Chest ({unit})</th>
                <th className="py-3 px-4">Waist ({unit})</th>
                <th className="py-3 px-4">Sleeve ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9] font-mono">
              {measurements.map((m, idx) => (
                <tr key={m.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F0EA]'}>
                  <td className="py-3 px-4 font-bold text-[#1A1A1A]">{m.size}</td>
                  <td className="py-3 px-4">{unit === 'cm' ? m.chestCm : m.chestIn}</td>
                  <td className="py-3 px-4">{unit === 'cm' ? m.waistCm : m.waistIn}</td>
                  <td className="py-3 px-4">{unit === 'cm' ? m.sleeveCm : m.sleeveIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tailoring Notes */}
        <div className="p-4 bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-2 text-xs text-[#4A4947]">
          <h4 className="font-serif text-lg text-[#1A1A1A]">Need Fit Assistance?</h4>
          <p className="leading-relaxed">
            If you fall between two sizes, we recommend selecting the larger size for a relaxed architectural drape, or consulting our AI Stylist concierge for personalized fitting notes based on your height and shoulder width.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#1C1B20] text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-[#B88A58] transition-colors"
        >
          Return to Product
        </button>
      </div>
    </div>
  );
};
