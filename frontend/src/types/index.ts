export interface ActivityReport {
  id?: number;
  sectionName: string;
  date: string;
  preacher?: string;
  totalFaithful: number;
  offering: number;
}

export interface DashboardStats {
  totalReports: number;
  totalFaithful: number;
  totalOffering: number;
  activeSections: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'responsable';
  sectionName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface ActivityReport {
  id: string;
  date: string;
  sectionName: string;
  preacher: string;
  totalFaithful: number;
  menCount: number;
  womenCount: number;
  childrenCount: number;
  youthCount: number;
  offering: number;
  notes: string;
  submittedBy: string;
  submittedAt: string;
}

export interface DashboardStats {
  totalReports: number;
  totalFaithful: number;
  totalOffering: number;
  activeSections: number;
}

export interface ExportConfig {
  startDate: string;
  endDate: string;
  section: string;
  includeStats: boolean;
  includeDetails: boolean;
  includeNotes: boolean;
}
