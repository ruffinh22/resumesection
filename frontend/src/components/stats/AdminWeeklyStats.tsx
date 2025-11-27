import React from 'react';
import { useAllWeeklyStats, formatCFA, formatWeek } from '../../hooks/useWeeklyStats';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { BarChart3, AlertCircle, TrendingUp } from 'lucide-react';

interface AdminWeeklyStatsProps {
  date?: string;
  className?: string;
}

export const AdminWeeklyStats: React.FC<AdminWeeklyStatsProps> = ({ date, className = '' }) => {
  const { data: stats, isLoading, error } = useAllWeeklyStats(date);

  if (isLoading) {
    return (
      <Card className={`p-3 sm:p-4 lg:p-6 ${className}`}>
        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 sm:h-10 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-600" />
        <AlertDescription className="text-xs sm:text-sm text-red-800">
          ❌ Erreur lors du chargement des statistiques
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
        <AlertDescription className="text-xs sm:text-sm text-blue-800">
          ℹ️ Aucune donnée pour cette semaine
        </AlertDescription>
      </Alert>
    );
  }

  // Calculer les totaux
  const totalOffering = stats.reduce((sum, s) => sum + s.total_offering, 0);
  const totalAttendees = stats.reduce((sum, s) => sum + s.total_attendees, 0);
  const totalServices = stats.reduce((sum, s) => sum + s.total_services, 0);

  return (
    <Card className={`p-3 sm:p-4 lg:p-6 overflow-hidden shadow-sm border border-slate-200 ${className}`}>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        {/* En-tête */}
        <div className="border-b border-slate-200 pb-2 sm:pb-3 lg:pb-4">
          <h3 className="font-bold text-sm sm:text-base lg:text-lg text-slate-900 flex items-center gap-1.5 sm:gap-2 truncate">
            <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 flex-shrink-0" />
            <span className="truncate">📊 Vue d'ensemble - Toutes les sections</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 truncate">
            {stats.length} section{stats.length > 1 ? 's' : ''} - Semaine du {stats[0] ? formatWeek(stats[0].week_start) : ''}
          </p>
        </div>

        {/* Résumé global */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-4">
          <div className="bg-green-50 rounded-lg p-2 sm:p-3 lg:p-4 border border-green-200 min-w-0">
            <p className="text-xs lg:text-sm text-slate-600 font-medium truncate">💰 Total</p>
            <p className="text-sm sm:text-base lg:text-2xl font-bold text-green-700 mt-0.5 sm:mt-1 lg:mt-2 truncate">
              {formatCFA(totalOffering)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 border border-blue-200 min-w-0">
            <p className="text-xs lg:text-sm text-slate-600 font-medium truncate">👥 Fidèles</p>
            <p className="text-sm sm:text-base lg:text-2xl font-bold text-blue-700 mt-0.5 sm:mt-1 lg:mt-2 truncate">{totalAttendees}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-200 min-w-0">
            <p className="text-xs lg:text-sm text-slate-600 font-medium truncate">⛪ Services</p>
            <p className="text-sm sm:text-base lg:text-2xl font-bold text-purple-700 mt-0.5 sm:mt-1 lg:mt-2 truncate">{totalServices}</p>
          </div>
        </div>

        {/* Tableau des sections */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs lg:text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                <th className="text-left py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap">📌 Section</th>
                <th className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap">💰 Offrande</th>
                <th className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden sm:table-cell">👥 Fidèles</th>
                <th className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden lg:table-cell">⛪ Services</th>
                <th className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden lg:table-cell">📊 Moy/Serv</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr
                  key={stat.id}
                  className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition`}
                >
                  <td className="py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-medium text-slate-900 whitespace-nowrap">
                    📍 Section {stat.section_id}
                  </td>
                  <td className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 font-semibold text-green-700 truncate">
                    {formatCFA(stat.total_offering)}
                  </td>
                  <td className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 text-slate-600 hidden sm:table-cell whitespace-nowrap">
                    {stat.total_attendees}
                  </td>
                  <td className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 text-slate-600 hidden lg:table-cell whitespace-nowrap">
                    {stat.total_services}
                  </td>
                  <td className="text-right py-1.5 sm:py-2 lg:py-3 px-2 sm:px-3 text-orange-600 font-medium hidden lg:table-cell whitespace-nowrap">
                    {stat.total_services > 0
                      ? formatCFA(stat.total_offering / stat.total_services)
                      : formatCFA(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indicateurs de tendance */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-indigo-200">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-semibold text-slate-900 text-xs sm:text-sm lg:text-base">📈 Analyse</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-0.5 sm:space-y-1">
            <li>• <span className="font-medium">Moy/section:</span> {formatCFA(totalOffering / stats.length)}</li>
            <li>• <span className="font-medium">Moy/fidèle:</span> {formatCFA(totalOffering / (totalAttendees || 1))}</li>
            <li>• <span className="font-medium">Sections actives:</span> {stats.filter(s => s.total_services > 0).length}/{stats.length}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default AdminWeeklyStats;
