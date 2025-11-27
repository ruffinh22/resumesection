import React, { useState, useEffect } from 'react';
import { StatsCards } from './StatsCards';
import { ReportsTable } from './ReportsTable';
import { ActivityReport, DashboardStats } from '../../types';
import { getReports } from '../../utils/storage';

export const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<ActivityReport[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    totalFaithful: 0,
    totalOffering: 0,
    activeSections: 0
  });

  useEffect(() => {
    const loadData = () => {
      const allReports = getReports();
      setReports(allReports.slice(-10).reverse());

      const totalReports = allReports.length;
      const totalFaithful = allReports.reduce((sum, report) => sum + report.totalFaithful, 0);
      const totalOffering = allReports.reduce((sum, report) => sum + report.offering, 0);
      const activeSections = new Set(allReports.map(report => report.sectionName)).size;

      setStats({ totalReports, totalFaithful, totalOffering, activeSections });
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-sm lg:text-base text-gray-600">
          Vue d'ensemble des activités de l'église
        </p>
      </div>
      
      <StatsCards stats={stats} />
      <ReportsTable reports={reports} />
    </div>
  );
};
