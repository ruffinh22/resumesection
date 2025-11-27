
import React from 'react';
import ReportForm from '../ReportForm';

const ReportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* En-tête */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 lg:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
            📝 Comptes-Rendus
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">
            Saisissez le compte-rendu hebdomadaire de votre section
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-6">
          <ReportForm />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
