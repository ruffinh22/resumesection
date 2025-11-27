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
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Erreur lors du chargement des statistiques
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Aucune donnée pour cette semaine
        </AlertDescription>
      </Alert>
    );
  }

  // Calculer les totaux
  const totalOffering = stats.reduce((sum, s) => sum + s.total_offering, 0);
  const totalAttendees = stats.reduce((sum, s) => sum + s.total_attendees, 0);
  const totalServices = stats.reduce((sum, s) => sum + s.total_services, 0);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="border-b pb-4">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Vue d'ensemble - Toutes les sections
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {stats.length} section{stats.length > 1 ? 's' : ''} - Semaine du {stats[0] ? formatWeek(stats[0].week_start) : ''}
          </p>
        </div>

        {/* Résumé global */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-600 font-medium">Total Général</p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {formatCFA(totalOffering)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-600 font-medium">Fidèles</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{totalAttendees}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-xs text-gray-600 font-medium">Services</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">{totalServices}</p>
          </div>
        </div>

        {/* Tableau des sections */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Section</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Offrande</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Fidèles</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Services</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Moy./Service</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr
                  key={stat.id}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  <td className="py-3 px-3 font-medium text-gray-900">
                    {`Section ${stat.section_id}`}
                  </td>
                  <td className="text-right py-3 px-3 font-semibold text-green-700">
                    {formatCFA(stat.total_offering)}
                  </td>
                  <td className="text-right py-3 px-3 text-gray-600">
                    {stat.total_attendees}
                  </td>
                  <td className="text-right py-3 px-3 text-gray-600">
                    {stat.total_services}
                  </td>
                  <td className="text-right py-3 px-3 text-orange-600 font-medium">
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
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-gray-900">Analyse</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Moyenne par section: {formatCFA(totalOffering / stats.length)}</li>
            <li>• Moyenne par fidèle: {formatCFA(totalOffering / (totalAttendees || 1))}</li>
            <li>• Sections actives: {stats.filter(s => s.total_services > 0).length}/{stats.length}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default AdminWeeklyStats;
