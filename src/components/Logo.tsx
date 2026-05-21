import React from 'react';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
}

/**
 * Shared Logo component — renders the GENY LAB logo image
 * with a "BY INGRESARIOS" tagline underneath.
 */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  imgClassName = 'w-36 md:w-44 object-contain',
  taglineClassName = '',
  showTagline = true,
}) => (
  <div className={`inline-flex flex-col items-center ${className}`}>
    <img src="/images/78.png" alt="GENY LAB" className={imgClassName} />
    {showTagline && (
      <span
        className={`text-[9px] font-bold uppercase tracking-[0.3em] text-white mt-1 ${taglineClassName}`}
      >
        by Ingresarios
      </span>
    )}
  </div>
);
