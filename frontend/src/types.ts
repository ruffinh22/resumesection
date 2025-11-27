export type UserRole = 'admin' | 'section';

export interface AuthResponse {
  access_token: string;
}

export interface Report {
  id?: number;
  section_id: number;
  date: string;
  preacher: string;
  total_attendees: number;
  men: number;
  women: number;
  children: number;
  youth: number;
  offering: number;
}

export interface SummaryReport {
  section_id: number;
  date: string;
  preacher: string;
  total_attendees: number;
  men: number;
  women: number;
  children: number;
  youth: number;
  offering: number;
}

// Réexporter types additionnels créés dans `types/index.ts` (compatibilité import)
export * from './types/index';
