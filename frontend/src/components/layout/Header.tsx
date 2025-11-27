import React from 'react';
import { getLogoUrl } from '../../utils/assets';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'ResumeSection',
  subtitle = '✝️ Gestion des rapports de service',
  showLogo = true 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4">
          {showLogo && (
            <div className="flex-shrink-0">
              <img 
                src={getLogoUrl('full')} 
                alt="Logo Église" 
                className="w-12 h-12 bg-white rounded-lg p-1"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            <p className="text-blue-100 text-sm sm:text-base">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
