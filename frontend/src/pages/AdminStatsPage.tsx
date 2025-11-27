import React, { useState } from 'react';
import { AdminWeeklyStats } from '../components/stats/AdminWeeklyStats';
import { Card } from '../components/ui/card';
import { Calendar } from 'lucide-react';

const AdminStatsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100 py-3 sm:py-6 lg:py-8 px-2 sm:px-3 lg:px-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header avec Badge */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl">📊</span>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                Statistiques Hebdomadaires - Admin
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
                Vue d'ensemble complète de toutes les sections
              </p>
            </div>
          </div>
        </div>

        {/* Contrôles de Filtre */}
        <Card className="overflow-hidden shadow-md border border-indigo-200 bg-gradient-to-r from-indigo-50 to-slate-50">
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="space-y-2.5 sm:space-y-3">
              <label htmlFor="week-date" className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-indigo-600 flex-shrink-0" />
                <span>📅 Sélectionner une semaine</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1">
                  <input
                    id="week-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-slate-900"
                  />
                </div>
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">Semaine actuelle</span>
                  <span className="sm:hidden">Actuelle</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistiques - Composant Principal */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <AdminWeeklyStats date={selectedDate} />
        </div>

        {/* Tips & Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          <Card className="overflow-hidden shadow-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="p-3 sm:p-4 lg:p-5">
              <h3 className="font-bold text-blue-900 mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1.5">
                <span>💡</span>
                <span>Information</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                Affiche les statistiques hebdomadaires de <strong>toutes les sections</strong>. Les données se mettent à jour automatiquement après chaque rapport.
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden shadow-md border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <div className="p-3 sm:p-4 lg:p-5">
              <h3 className="font-bold text-green-900 mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1.5">
                <span>✅</span>
                <span>Conseils</span>
              </h3>
              <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
                Utilisez le filtre de date pour analyser les <strong>tendances hebdomadaires</strong>. Comparez les offrandes et la participation.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;
