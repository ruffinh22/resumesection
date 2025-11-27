import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService, WeeklyStats, CurrentOffering } from '../api/reports';
import { useAuth } from '../components/auth/AuthProvider';

/**
 * Hook pour récupérer les stats hebdomadaires
 */
export const useWeeklyStats = (date?: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['weekly-stats', date],
    queryFn: () => reportService.getWeeklyStats(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: isAuthenticated, // ✅ Ne lance la requête que si authentifié
    placeholderData: {
      id: 0,
      section_id: 0,
      week_start: new Date().toISOString().split('T')[0],
      week_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_offering: 0,
      currency: 'XOF',
      total_attendees: 0,
      total_services: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
};

/**
 * Hook pour récupérer l'offrande actuelle
 */
export const useCurrentOffering = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery<CurrentOffering>({
    queryKey: ['current-offering'],
    queryFn: () => reportService.getCurrentOffering(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    enabled: isAuthenticated, // ✅ Ne lance la requête que si authentifié
    placeholderData: {
      section_id: 0,
      week_start: new Date().toISOString().split('T')[0],
      total_offering: 0,
      currency: 'XOF',
      msg: 'Chargement...',
    },
  });
};

/**
 * Hook pour récupérer toutes les stats (admin)
 */
export const useAllWeeklyStats = (date?: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['all-weekly-stats', date],
    queryFn: () => reportService.getAllWeeklyStats(date),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: isAuthenticated, // ✅ Ne lance la requête que si authentifié
  });
};

/**
 * Hook pour rafraîchir les stats
 */
export const useRefreshStats = () => {
  const queryClient = useQueryClient();

  const refreshWeeklyStats = (date?: string) => {
    queryClient.invalidateQueries({ queryKey: ['weekly-stats', date] });
  };

  const refreshCurrentOffering = () => {
    queryClient.invalidateQueries({ queryKey: ['current-offering'] });
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['weekly-stats'] });
    queryClient.invalidateQueries({ queryKey: ['current-offering'] });
    queryClient.invalidateQueries({ queryKey: ['all-weekly-stats'] });
  };

  return { refreshWeeklyStats, refreshCurrentOffering, refreshAll };
};

/**
 * Formate le montant en francs CFA
 */
export const formatCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formate une date de début de semaine
 */
export const formatWeek = (weekStart: string): string => {
  const date = new Date(weekStart);
  const weekEnd = new Date(date);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return `${date.toLocaleDateString('fr-FR')} - ${weekEnd.toLocaleDateString('fr-FR')}`;
};
