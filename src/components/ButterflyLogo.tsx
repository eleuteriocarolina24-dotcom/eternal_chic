import React from 'react';

interface ButterflyLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'gold';
}

export const ButterflyLogo: React.FC<ButterflyLogoProps> = ({
  className = '',
  size = 32,
  showText = false,
  textSize = 'md',
  variant = 'gold',
}) => {
  const primaryColor = variant === 'light' ? '#F9F7F5' : variant === 'dark' ? '#3D2B1F' : '#3D2B1F';
  const secondaryColor = variant === 'light' ? '#D9C5B2' : variant === 'dark' ? '#5C3D2E' : '#D9C5B2';
  const accentColor = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#2C1F16' : '#E8DDD3';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Delicate Stylized Butterfly SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Left Upper Wing */}
        <path
          d="M48 46C40 28 20 18 10 24C2 29 6 48 24 54C34 58 44 52 48 46Z"
          fill={primaryColor}
          fillOpacity="0.9"
        />
        {/* Left Wing Inner Detail */}
        <path
          d="M45 44C38 32 26 25 18 28C14 30 16 42 27 47C34 50 41 46 45 44Z"
          fill={secondaryColor}
          fillOpacity="0.6"
        />
        {/* Right Upper Wing */}
        <path
          d="M52 46C60 28 80 18 90 24C98 29 94 48 76 54C66 58 56 52 52 46Z"
          fill={primaryColor}
          fillOpacity="0.9"
        />
        {/* Right Wing Inner Detail */}
        <path
          d="M55 44C62 32 74 25 82 28C86 30 84 42 73 47C66 50 59 46 55 44Z"
          fill={secondaryColor}
          fillOpacity="0.6"
        />
        {/* Left Lower Wing */}
        <path
          d="M47 52C36 56 22 66 26 78C30 86 44 80 48 64C49 59 48 54 47 52Z"
          fill={secondaryColor}
          fillOpacity="0.95"
        />
        {/* Right Lower Wing */}
        <path
          d="M53 52C64 56 78 66 74 78C70 86 56 80 52 64C51 59 52 54 53 52Z"
          fill={secondaryColor}
          fillOpacity="0.95"
        />
        {/* Body */}
        <ellipse cx="50" cy="50" rx="2.5" ry="18" fill={primaryColor} />
        {/* Head */}
        <circle cx="50" cy="30" r="3.5" fill={primaryColor} />
        {/* Delicate Antennae */}
        <path
          d="M48 28C44 22 38 18 34 18"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="33" cy="18" r="1.5" fill={primaryColor} />
        <path
          d="M52 28C56 22 62 18 66 18"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="67" cy="18" r="1.5" fill={primaryColor} />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-serif tracking-[0.2em] font-light uppercase leading-tight ${
              variant === 'light' ? 'text-[#F9F7F5]' : 'text-[#3D2B1F]'
            } ${
              textSize === 'sm'
                ? 'text-sm'
                : textSize === 'lg'
                ? 'text-xl'
                : textSize === 'xl'
                ? 'text-2xl tracking-[0.25em]'
                : 'text-base'
            }`}
          >
            Eternal Chic
          </span>
          <span
            className={`text-[9px] tracking-[0.3em] uppercase font-sans font-medium opacity-60 ${
              variant === 'light' ? 'text-[#D9C5B2]' : 'text-[#8C7A6B]'
            }`}
          >
            Gestão de Luxo
          </span>
        </div>
      )}
    </div>
  );
};
