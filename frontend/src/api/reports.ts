/**
 * Services API pour les rapports et les stats hebdomadaires
 */

import { apiClient } from './client';

export interface Report {
  id: number;
  section_id: number;
  date: string;
  preacher: string;
  total_attendees: number;
  men: number;
  women: number;
  children: number;
  youth: number;
  offering: number;
  currency: string;
  notes?: string;
  submitted_by?: string;
  submitted_at?: string;
}

export interface CreateReportRequest {
  date: string;
  preacher: string;
  total_attendees: number;
  men?: number;
  women?: number;
  children?: number;
  youth?: number;
  offering?: number;
  notes?: string;
}

export interface WeeklyStats {
  id: number;
  section_id: number;
  week_start: string;
  week_end: string;
  total_offering: number;
  currency: string;
  total_attendees: number;
  total_services: number;
  created_at: string;
  updated_at: string;
}

export interface CurrentOffering {
  section_id: number;
  week_start: string;
  total_offering: number;
  currency: string;
  msg: string;
}

export interface SummaryParams {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
}

export const reportService = {
  /**
   * Crée un nouveau rapport
   */
  createReport: async (data: CreateReportRequest): Promise<{ msg: string; id: number }> => {
    return apiClient.post('/report', data);
  },

  /**
   * Récupère mes rapports (utilisateur connecté uniquement)
   */
  getMyReports: async (params?: SummaryParams): Promise<Report[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.start) queryParams.start = params.start;
    if (params?.end) queryParams.end = params.end;

    return apiClient.get('/my-reports', queryParams);
  },

  /**
   * Récupère le résumé des rapports (admin uniquement)
   */
  getSummary: async (params?: SummaryParams): Promise<Report[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.start) queryParams.start = params.start;
    if (params?.end) queryParams.end = params.end;

    return apiClient.get('/summary', queryParams);
  },

  /**
   * Exporte les rapports en PDF
   */
  exportPDF: async (params?: SummaryParams): Promise<Blob> => {
    const queryParams: Record<string, string> = {};
    if (params?.start) queryParams.start = params.start;
    if (params?.end) queryParams.end = params.end;

    return apiClient.getBlob('/summary/pdf', queryParams);
  },

  /**
   * Supprime un rapport
   */
  deleteReport: async (reportId: number): Promise<{ msg: string }> => {
    return apiClient.delete(`/report/${reportId}`);
  },

  /**
   * Télécharge le PDF d'un rapport spécifique
   */
  downloadReportPDF: async (reportId: number): Promise<Blob> => {
    return apiClient.getBlob(`/report/${reportId}/pdf`);
  },

  /**
   * Récupère les stats hebdomadaires de la semaine courante
   */
  getWeeklyStats: async (date?: string): Promise<WeeklyStats> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    return apiClient.get('/weekly-stats', params);
  },

  /**
   * Récupère l'offrande actuelle (semaine courante)
   */
  getCurrentOffering: async (): Promise<CurrentOffering> => {
    return apiClient.get('/current-offering');
  },

  /**
   * Récupère toutes les stats hebdomadaires (admin)
   */
  getAllWeeklyStats: async (date?: string): Promise<WeeklyStats[]> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    return apiClient.get('/admin/weekly-stats', params);
  },
};

