/**
 * Services API pour l'authentification
 */

import { apiClient } from './client';

export interface LoginResponse {
  access_token: string;
  role: 'admin' | 'section';
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: 'admin' | 'section';
}

export interface RegisterResponse {
  msg: string;
  id: number;
}

export const authService = {
  /**
   * Effectue la connexion de l'utilisateur
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return apiClient.post('/login', { username, password });
  },

  /**
   * Enregistre un nouvel utilisateur
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post('/register', data);
  },

  /**
   * Vérifie le statut du backend
   */
  health: async (): Promise<{ msg: string }> => {
    return apiClient.get('/');
  },
};
