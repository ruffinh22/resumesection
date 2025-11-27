import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getLogoUrl } from '../utils/assets';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Afficher les erreurs pendant 5 secondes
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    const success = await login(username, password);
    if (!success && !error) {
      setLocalError('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 md:p-8">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex flex-col items-center space-y-3 pb-4 border-b-2 border-blue-100">
            <img 
              src={getLogoUrl('full')} 
              alt="Logo Église Évangélique" 
              className="w-20 h-20"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="text-center space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
                ResumeSection
              </h2>
              <p className="text-sm text-blue-600 font-medium">
                ✝️ Gestion des rapports de service
              </p>
              <p className="text-xs text-gray-500">
                Église Évangélique
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert
              className={error.includes('Mode démo') ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}
            >
              <AlertDescription
                className={error.includes('Mode démo') ? 'text-blue-800' : 'text-red-800'}
              >
                {error}
              </AlertDescription>
            </Alert>
          )}

          {localError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {localError}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLocalError('');
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError('');
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
