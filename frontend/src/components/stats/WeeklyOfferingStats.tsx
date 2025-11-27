import React from 'react';
import { useCurrentOffering, formatCFA, formatWeek } from '../../hooks/useWeeklyStats';
import { useAuth } from '../auth/AuthProvider';
import { Card } from '../ui/card';
import { AlertCircle, DollarSign } from 'lucide-react';

interface WeeklyOfferingStatsProps {
  className?: string;
}

export const WeeklyOfferingStats: React.FC<WeeklyOfferingStatsProps> = ({ className = '' }) => {
  const { isAuthenticated } = useAuth();
  const { data: offering, isLoading, error } = useCurrentOffering();

  if (!isAuthenticated) {
    return (
      <Card className={`p-1.5 sm:p-2 bg-gray-50 border-gray-200 ${className}`}>
        <div className="flex items-start gap-1 sm:gap-2">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-700 truncate">
            Connexion requise
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`p-1.5 sm:p-2 ${className}`}>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-1.5 sm:p-2 bg-red-50 border-red-200 ${className}`}>
        <div className="flex items-start gap-1 sm:gap-2">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-800 truncate">
            Erreur chargement stats
          </div>
        </div>
      </Card>
    );
  }

  if (!offering) {
    return null;
  }

  return (
    <Card className={`p-1.5 sm:p-2 bg-green-50 border border-green-200 ${className}`}>
      <div className="space-y-0.5">
        {/* Header - Ultra Compact */}
        <div className="flex items-center gap-0.5 min-w-0">
          <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
          <h3 className="font-semibold text-xs text-gray-800 truncate">Offrande</h3>
        </div>

        {/* Montant - Compact */}
        <p className="text-base sm:text-lg font-bold text-green-700 truncate leading-tight">
          {formatCFA(offering.total_offering)}
        </p>

        {/* Date - Mini */}
        <p className="text-xs text-gray-600 truncate">
          {formatWeek(offering.week_start)}
        </p>

        {/* Statut - Mini badge */}
        <div className="bg-green-100 rounded px-1 py-0.5 text-xs text-green-700 text-center">
          ✓ À jour
        </div>
      </div>
    </Card>
  );
};

export default WeeklyOfferingStats;
