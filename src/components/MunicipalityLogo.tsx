import React from 'react';

interface MunicipalityLogoProps {
  className?: string;
  size?: number | string;
  watermark?: boolean;
  alt?: string;
}

export const MunicipalityLogo: React.FC<MunicipalityLogoProps> = ({
  className = 'w-14 h-14',
  size,
  watermark = false,
  alt = 'সীতাকুণ্ড পৌরসভা মনোগ্রাম',
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <img
      src="/logo.png"
      alt={alt}
      style={style}
      className={`object-contain select-none pointer-events-none rounded-full inline-block ${
        watermark ? 'opacity-10 grayscale' : ''
      } ${className}`}
      loading="eager"
    />
  );
};

export default MunicipalityLogo;
