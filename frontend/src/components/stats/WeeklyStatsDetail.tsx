import React from 'react';
import { useWeeklyStats, formatCFA, formatWeek } from '../../hooks/useWeeklyStats';
import { useAuth } from '../auth/AuthProvider';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { BarChart, Users, Zap, AlertCircle } from 'lucide-react';

interface WeeklyStatsDetailProps {
  date?: string;
  className?: string;
}

export const WeeklyStatsDetail: React.FC<WeeklyStatsDetailProps> = ({ date, className = '' }) => {
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading, error } = useWeeklyStats(date);

  if (!isAuthenticated) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-xs sm:text-sm text-gray-700 truncate">
          Connexion requise pour les statistiques
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className={`p-4 sm:p-6 space-y-3 sm:space-y-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-xs sm:text-sm text-red-800 truncate">
          Erreur chargement statistiques
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs sm:text-sm text-blue-800 truncate">
          Aucune donnée cette semaine
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={`p-4 sm:p-6 ${className}`}>
      <div className="space-y-4 sm:space-y-6">
        {/* En-tête - Responsive */}
        <div className="border-b pb-3 sm:pb-4">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2 truncate">
            <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Statistiques Hebdo</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
            Semaine du {formatWeek(stats.week_start)}
          </p>
        </div>

        {/* Grille des stats - Responsive mobile/tablet/desktop */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
          {/* Offrande Total */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200 overflow-hidden">
            <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Offrande Total</p>
            <p className="text-lg sm:text-2xl font-bold text-green-700 mt-1 sm:mt-2 truncate">
              {formatCFA(stats.total_offering)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{stats.currency}</p>
          </div>

          {/* Fidèles total */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200 overflow-hidden">
            <p className="text-xs sm:text-sm text-gray-600 font-medium flex items-center gap-1 truncate">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Fidèles</span>
            </p>
            <p className="text-lg sm:text-2xl font-bold text-blue-700 mt-1 sm:mt-2">
              {stats.total_attendees}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">personnes</p>
          </div>

          {/* Services */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200 overflow-hidden">
            <p className="text-xs sm:text-sm text-gray-600 font-medium flex items-center gap-1 truncate">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Services</span>
            </p>
            <p className="text-lg sm:text-2xl font-bold text-purple-700 mt-1 sm:mt-2">
              {stats.total_services}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">rapports</p>
          </div>

          {/* Moyenne par service */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-200 overflow-hidden">
            <p className="text-xs sm:text-sm text-gray-600 font-medium truncate whitespace-nowrap">
              Moy./Service
            </p>
            <p className="text-lg sm:text-2xl font-bold text-orange-700 mt-1 sm:mt-2 truncate">
              {stats.total_services > 0
                ? formatCFA(stats.total_offering / stats.total_services)
                : formatCFA(0)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">par rapport</p>
          </div>
        </div>

        {/* Barre de progression - Responsive */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Progression semaine</span>
            <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">{stats.total_services}/7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((stats.total_services / 7) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Métadonnées - Responsive */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t truncate">
          MAJ: {new Date(stats.updated_at).toLocaleString('fr-FR', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </Card>
  );
};

export default WeeklyStatsDetail;
