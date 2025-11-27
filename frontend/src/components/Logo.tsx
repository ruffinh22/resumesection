import React from 'react';
import { getLogoUrl } from '../utils/assets';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full',
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const logoPath = variant === 'compact' || variant === 'icon' 
    ? getLogoUrl('compact')
    : getLogoUrl('full');
  
  if (variant === 'icon') {
    return (
      <img 
        src={logoPath}
        alt="Logo Église"
        className={`${sizeMap[size]} ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoPath}
        alt="Logo Église"
        className={`${sizeMap[size]}`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-blue-900">ResumeSection</span>
          <span className="text-xs text-blue-600">✝️ Église Évangélique</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
