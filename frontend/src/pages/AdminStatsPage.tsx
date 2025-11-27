import React, { useState } from 'react';
import { AdminWeeklyStats } from '../components/stats/AdminWeeklyStats';
import { Card } from '../components/ui/card';
import { Calendar } from 'lucide-react';

const AdminStatsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Statistiques Hebdomadaires - Admin</h1>
        <p className="text-sm lg:text-base text-gray-600">
          Vue d'ensemble de toutes les sections
        </p>
      </div>

      {/* Filtre par date */}
      <Card className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label htmlFor="week-date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              Sélectionner une semaine
            </label>
            <input
              id="week-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSelectedDate('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Semaine actuelle
          </button>
        </div>
      </Card>

      {/* Statistiques */}
      <AdminWeeklyStats date={selectedDate} />

      {/* Informations */}
      <Card className="p-4 lg:p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Information</h3>
        <p className="text-sm text-blue-800">
          Cette page affiche les statistiques hebdomadaires de toutes les sections.
          Les données sont actualisées automatiquement après chaque soumission de rapport.
        </p>
      </Card>
    </div>
  );
};

export default AdminStatsPage;
