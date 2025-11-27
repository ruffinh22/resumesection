import { apiClient } from './client'

export interface User {
  id: number
  username: string
  role: 'admin' | 'section' | 'viewer'
  created_at?: string
}

export interface CreateUserPayload {
  username: string
  password: string
  role: 'admin' | 'section' | 'viewer'
}

export interface UpdateUserPayload {
  username?: string
  password?: string
  role?: 'admin' | 'section' | 'viewer'
}

/**
 * Récupère la liste de tous les utilisateurs (admin seulement)
 */
export const fetchUsers = async (): Promise<User[]> => {
  return apiClient.get<User[]>('/users')
}

/**
 * Récupère les détails d'un utilisateur spécifique
 */
export const fetchUser = async (userId: number): Promise<User> => {
  return apiClient.get<User>(`/users/${userId}`)
}

/**
 * Crée un nouvel utilisateur (admin seulement)
 */
export const createUser = async (payload: CreateUserPayload): Promise<User & { id: number }> => {
  return apiClient.post<User & { id: number }>('/users', payload)
}

/**
 * Met à jour un utilisateur (admin seulement)
 */
export const updateUser = async (userId: number, payload: UpdateUserPayload): Promise<User> => {
  return apiClient.put<User>(`/users/${userId}`, payload)
}

/**
 * Supprime un utilisateur (admin seulement)
 */
export const deleteUser = async (userId: number): Promise<{ msg: string }> => {
  return apiClient.delete<{ msg: string }>(`/users/${userId}`)
}
