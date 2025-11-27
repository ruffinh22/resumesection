import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

interface Summary {
  count: number;
  total_attendees: number;
  offering: number;
}

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-white shadow rounded-lg p-4 w-full sm:w-1/3">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
  </div>
);

const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user || user.role !== 'admin') {
        setError('Accès statistique réservé aux administrateurs.');
        return;
      }

      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/summary', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.msg || 'Erreur récupération statistiques');
          return;
        }
        setSummary({
          count: data.count || 0,
          total_attendees: data.total_attendees || 0,
          offering: data.offering || 0,
        });
      } catch (e) {
        setError('Impossible de joindre le serveur');
      }
    };

    fetchSummary();
  }, [user]);

  if (error) {
    return <div className="text-sm text-gray-600">{error}</div>;
  }

  if (!summary) {
    return <div className="text-sm text-gray-600">Chargement des statistiques…</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <StatCard label="Nombre de rapports" value={summary.count} />
      <StatCard label="Total participants" value={summary.total_attendees} />
      <StatCard label="Total offrande" value={`${summary.offering} XOF`} />
    </div>
  );
};

export default StatsCards;
