/**
 * Configuration API et client HTTP
 * Point central pour toutes les requêtes vers le backend
 */

// @ts-ignore - Vite env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

export interface ApiError {
  msg: string;
  error?: string;
  errors?: Record<string, string[]>;
  status: number;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // ✅ Recharger le token du localStorage à chaque requête
    const token = this.token || localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        msg: data.msg || 'Une erreur s\'est produite',
        error: data.error,
        errors: data.errors,
        status: response.status,
      };
      throw error;
    }

    return data;
  }

  async get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: Record<string, any>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: Record<string, any>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async getBlob(path: string, params?: Record<string, string | number>): Promise<Blob> {
    const url = new URL(`${this.baseUrl}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // ✅ Ajouter le token en query parameter comme fallback
    const token = this.token || localStorage.getItem('token');
    if (token) {
      url.searchParams.append('token', token);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      const error: ApiError = {
        msg: data.msg || 'Erreur lors du téléchargement',
        status: response.status,
      };
      throw error;
    }

    return response.blob();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
