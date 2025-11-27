import { ActivityReport, User } from '../types';

const REPORTS_KEY = 'church_reports';
const USERS_KEY = 'church_users';

// Rapports d'activité
export const getReports = (): ActivityReport[] => {
  try {
    const reports = localStorage.getItem(REPORTS_KEY);
    return reports ? JSON.parse(reports) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des rapports:', error);
    return [];
  }
};

    export const saveReport = (report: ActivityReport): void => {
      try {
        const reports = getReports();
        reports.push(report);
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du rapport:', error);
      }
    };

    export const deleteReport = (reportId: string): void => {
      try {
        const reports = getReports();
        const filteredReports = reports.filter(report => String(report.id) !== reportId);
        localStorage.setItem(REPORTS_KEY, JSON.stringify(filteredReports));
      } catch (error) {
        console.error('Erreur lors de la suppression du rapport:', error);
      }
    };

    export const updateReport = (updatedReport: ActivityReport): void => {
      try {
        const reports = getReports();
        const index = reports.findIndex(report => report.id === updatedReport.id);
        if (index !== -1) {
          reports[index] = updatedReport;
          localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rapport:', error);
      }
    };

    // Utilisateurs
    export const getUsers = (): User[] => {
      try {
        const users = localStorage.getItem(USERS_KEY);
        const defaultUsers: User[] = [
          {
            id: '1',
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            createdAt: '2024-01-15T00:00:00.000Z'
          },
          {
            id: '2',
            username: 'section1',
            password: 'section123',
            role: 'responsable',
            sectionName: 'Section Centre',
            createdAt: '2024-01-16T00:00:00.000Z'
          },
          {
            id: '3',
            username: 'section2',
            password: 'section123',
            role: 'responsable',
            sectionName: 'Section Nord',
            createdAt: '2024-01-17T00:00:00.000Z'
          }
        ];
        if (!users) {
          localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
          return defaultUsers;
        }
        return JSON.parse(users);
      } catch (error) {
        console.error('Erreur lors de la lecture des utilisateurs:', error);
        return [];
      }
    };

    export const saveUser = (user: User): void => {
      try {
        const users = getUsers();
        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      }
    };

    export const deleteUser = (userId: string): void => {
      try {
        const users = getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      }
    };

    export const updateUser = (updatedUser: User): void => {
      try {
        const users = getUsers();
        const index = users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          users[index] = updatedUser;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      }
    };

    export const authenticateUser = (username: string, password: string): User | null => {
      try {
        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          user.lastLogin = new Date().toISOString();
          updateUser(user);
          return user;
        }
        return null;
      } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        return null;
      }
    };

    // Statistiques
    export const getStatistics = () => {
      try {
        const reports = getReports();
        const totalReports = reports.length;
        const totalFaithful = reports.reduce((sum, report) => sum + report.totalFaithful, 0);
        const totalOffering = reports.reduce((sum, report) => sum + report.offering, 0);
        const activeSections = new Set(reports.map(report => report.sectionName)).size;
        // Statistiques par mois
        const monthlyStats = reports.reduce((acc, report) => {
          const month = report.date.substring(0, 7); // YYYY-MM
          if (!acc[month]) {
            acc[month] = { reports: 0, faithful: 0, offering: 0 };
          }
          acc[month].reports++;
          acc[month].faithful += report.totalFaithful;
          acc[month].offering += report.offering;
          return acc;
        }, {} as Record<string, { reports: number; faithful: number; offering: number }>);
        // Statistiques par section
        const sectionStats = reports.reduce((acc, report) => {
          if (!acc[report.sectionName]) {
            acc[report.sectionName] = { reports: 0, faithful: 0, offering: 0 };
          }
          acc[report.sectionName].reports++;
          acc[report.sectionName].faithful += report.totalFaithful;
          acc[report.sectionName].offering += report.offering;
          return acc;
        }, {} as Record<string, { reports: number; faithful: number; offering: number }>);
        return {
          global: { totalReports, totalFaithful, totalOffering, activeSections },
          monthly: monthlyStats,
          sections: sectionStats
        };
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error);
        return {
          global: { totalReports: 0, totalFaithful: 0, totalOffering: 0, activeSections: 0 },
          monthly: {},
          sections: {}
        };
      }
    };

    // Fonctions utilitaires
    export const clearAllData = (): void => {
      try {
        localStorage.removeItem(REPORTS_KEY);
        localStorage.removeItem(USERS_KEY);
        localStorage.removeItem('church_user');
      } catch (error) {
        console.error('Erreur lors de la suppression des données:', error);
      }
    };

    export const exportData = () => {
      try {
        const reports = getReports();
        const users = getUsers();
        const data = {
          reports,
          users: users.map(({ password, ...user }) => user),
          exportDate: new Date().toISOString(),
          version: '1.0'
        };
        return JSON.stringify(data, null, 2);
      } catch (error) {
        console.error('Erreur lors de l\'export des données:', error);
        return null;
      }
    };

    export const importData = (jsonData: string): boolean => {
      try {
        const data = JSON.parse(jsonData);
        if (data.reports && Array.isArray(data.reports)) {
          localStorage.setItem(REPORTS_KEY, JSON.stringify(data.reports));
        }
        if (data.users && Array.isArray(data.users)) {
          const usersWithPasswords = data.users.map((user: any) => ({
            ...user,
            password: user.password || 'password123'
          }));
          localStorage.setItem(USERS_KEY, JSON.stringify(usersWithPasswords));
        }
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'import des données:', error);
        return false;
      }
    };
