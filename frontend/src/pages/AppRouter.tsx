import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import LoginPage from './LoginPage';
import MainApp from './MainApp';
import SectionDashboardPage from './SectionDashboardPage';

/**
 * Routeur principal qui affiche LoginPage, Dashboard Admin ou Dashboard Section
 * selon l'authentification et le rôle
 */
export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ✅ Router selon le rôle
  if (user?.role === 'section') {
    return <SectionDashboardPage />;
  }

  // Admin ou défaut
  return <MainApp />;
};
