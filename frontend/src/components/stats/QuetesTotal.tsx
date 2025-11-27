import React from 'react';
import { useCurrentOffering, formatCFA } from '../../hooks/useWeeklyStats';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface QuetesTotalProps {
  className?: string;
}

/**
 * Composant compact affichant les "Quêtes Totales" (Offrandes Totales) pour la semaine
 * Destiné à être affiché en évidence dans le dashboard
 */
export const QuetesTotal: React.FC<QuetesTotalProps> = ({ className = '' }) => {
  const { data: offering, isLoading, error } = useCurrentOffering();

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-green-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-green-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !offering) {
    return (
      <div className={`bg-red-50 rounded-xl p-6 border-2 border-red-200 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Erreur chargement</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      {/* En-tête - Responsive */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide truncate">Quêtes Totales</p>
          <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 truncate">Semaine en cours</p>
        </div>
        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 opacity-80 flex-shrink-0" />
      </div>

      {/* Montant principal - Responsive */}
      <div className="bg-white/70 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 overflow-hidden">
        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-700 tracking-tight truncate">
          {formatCFA(offering.total_offering)}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 font-medium">{offering.currency}</p>
      </div>

      {/* Barre verte */}
      <div className="h-1 bg-green-300 rounded-full"></div>

      {/* Texte informatif - Responsive */}
      <p className="text-xs text-gray-600 mt-2 sm:mt-3 italic text-center">
        Réinitialisation chaque lundi
      </p>
    </div>
  );
};

export default QuetesTotal;
