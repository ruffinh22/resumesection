
import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardPage from './DashboardPage';
import ReportsPage from './ReportsPage';
import UsersPage from './UsersPage';
import ExportPage from './ExportPage';
import AdminStatsPage from './AdminStatsPage';
import { useAuth } from '../components/auth/AuthProvider';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'reports':
        return <ReportsPage />;
      case 'stats':
        return user?.role === 'admin' ? <AdminStatsPage /> : <DashboardPage />;
      case 'users':
        return user?.role === 'admin' ? <UsersPage /> : <DashboardPage />;
      case 'export':
        return user?.role === 'admin' ? <ExportPage /> : <DashboardPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 pt-16 lg:pt-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default MainApp;