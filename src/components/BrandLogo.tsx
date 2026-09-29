import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
  onClick,
  showSubtitle = true,
}) => {
  // Color configuration
  const textColor =
    variant === 'dark' ? 'text-[#1C1B20]' : variant === 'gold' ? 'text-[#B88A58]' : 'text-[#F4F0EA]';
  const subtitleColor =
    variant === 'dark' ? 'text-[#4A4850]' : variant === 'gold' ? 'text-[#D8B48F]' : 'text-[#D8D3CD]';

  // Size scalings
  const titleSizes = {
    sm: 'text-lg tracking-tight',
    md: 'text-2xl sm:text-3xl tracking-tight',
    lg: 'text-3xl sm:text-4xl tracking-tight',
    xl: 'text-4xl sm:text-5xl tracking-tight',
  }[size];

  const subtitleSizes = {
    sm: 'text-[7px] tracking-[0.3em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.35em]',
    lg: 'text-[10px] sm:text-[11px] tracking-[0.4em]',
    xl: 'text-[11px] sm:text-[12px] tracking-[0.45em]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center text-center select-none py-0.5 ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
      title="Mari's Clothing Brand"
    >
      <span
        className={`font-serif font-semibold leading-none ${titleSizes} ${textColor}`}
        style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', 'Cormorant Garamond', 'Didot', serif" }}
      >
        Mari's
      </span>
      {showSubtitle && (
        <span
          className={`font-sans font-medium uppercase mt-1 leading-none ${subtitleSizes} ${subtitleColor}`}
        >
          CLOTHING BRAND
        </span>
      )}
    </div>
  );
};
