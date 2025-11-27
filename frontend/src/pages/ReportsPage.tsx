
import React from 'react';
import ReportForm from '../ReportForm';

const ReportsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  return (
    <div>
      <h1 className="text-2xl font-bold">Comptes-Rendus</h1>
      <p className="text-sm text-gray-600 mb-4">Saisissez le compte-rendu hebdomadaire</p>
      <ReportForm token={token} />
    </div>
  );
};

export default ReportsPage;
