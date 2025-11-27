import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authService } from '../../api/auth';
import { apiClient } from '../../api/client';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'section';
  sectionName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for fallback
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    username: 'section1',
    password: 'section123',
    role: 'section',
    sectionName: 'Section Centre'
  },
  {
    id: '3',
    username: 'section2',
    password: 'section123',
    role: 'section',
    sectionName: 'Section Nord'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('church_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    apiClient.setToken(newToken);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Essayer le login avec le backend
        const response = await authService.login(username, password);
        
        if (response.access_token) {
          // ✓ Backend login réussi
          setToken(response.access_token);

          const newUser: User = {
            id: username,
            username,
            role: response.role,
          };

          setUser(newUser);
          localStorage.setItem('church_user', JSON.stringify(newUser));
          setIsLoading(false);
          return true;
        }
      } catch (err: any) {
        // Backend indisponible - fallback sur mock users
        const foundUser = mockUsers.find(
          (u) => u.username === username && u.password === password
        );

        if (foundUser) {
          // Mock login réussi
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('church_user', JSON.stringify(userWithoutPassword));

          // Générer un token mock
          const mockToken = btoa(`${username}:${Date.now()}`);
          setToken(mockToken);

          setError(
            'ℹ️ Mode démo (backend indisponible). Connexion avec compte local.'
          );
          setIsLoading(false);
          return true;
        } else {
          // Credentials invalides dans les deux cas
          setError('Nom d\'utilisateur ou mot de passe incorrect');
        }
      }

      setIsLoading(false);
      return false;
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('church_user');
    localStorage.removeItem('token');
  }, [setToken]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
