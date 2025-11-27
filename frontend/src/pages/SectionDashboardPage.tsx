import React, { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useWeeklyStats, formatCFA, formatWeek } from '../hooks/useWeeklyStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { ReportForm } from '../components/reports/ReportForm';
import { ReportsDataTable } from '../components/reports/ReportsDataTable';
import { Users, TrendingUp, AlertCircle, BarChart3, LogOut, Eye, History, Edit2, Plus, Download } from 'lucide-react';
import { reportService, type Report } from '../api/reports';
import { useQuery } from '@tanstack/react-query';
import { getLogoUrl } from '../utils/assets';

type TabType = 'stats' | 'create' | 'reports' | 'history';

/**
 * Dashboard pour les responsables de section
 * Affiche uniquement les données de leur section
 */
const SectionDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useWeeklyStats();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Récupérer les rapports depuis l'API
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', 'my-reports'],
    queryFn: () => reportService.getMyReports(),
  });

  // Calculer les données affichées
  const displayStats = React.useMemo(() => {
    if (!stats) {
      return {
        total_offering: 0,
        total_attendees: 0,
        total_services: 0,
        average_offering: 0,
        week_start: new Date().toISOString().split('T')[0],
        week_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }

    const average = stats.total_services > 0 ? stats.total_offering / stats.total_services : 0;

    return {
      total_offering: stats.total_offering,
      total_attendees: stats.total_attendees,
      total_services: stats.total_services,
      average_offering: average,
      week_start: stats.week_start,
      week_end: stats.week_end,
    };
  }, [stats]);

  const handleLogout = () => {
    logout();
  };

  const handleDownloadReport = async (report: Report) => {
    setDownloadingId(report.id);
    try {
      const blob = await reportService.downloadReportPDF(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${report.date}-${report.preacher}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAllReports = async () => {
    try {
      const blob = await reportService.exportPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-section-complets.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erreur lors du téléchargement des rapports');
    }
  };

  if (!user || user.role !== 'section') {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Accès réservé aux responsables de section
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src={getLogoUrl('compact')} 
                alt="Logo Église Évangélique" 
                className="h-16 w-16"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Tableau de Bord Section
                </h1>
                <p className="text-slate-600 mt-1">
                  Bienvenue {user.username}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </Button>
          <Button
            onClick={() => setActiveTab('create')}
            variant={activeTab === 'create' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer un Rapport
          </Button>
          <Button
            onClick={() => setActiveTab('reports')}
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir les Rapports
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Historique
          </Button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {statsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erreur lors du chargement des statistiques
                </AlertDescription>
              </Alert>
            )}

            {statsLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-slate-500">
                    Chargement des statistiques...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Quetes */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quêtes</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCFA(displayStats.total_offering)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {displayStats.total_services} quête{displayStats.total_services !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                {/* Moyenne par Quete */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Moyenne</CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCFA(displayStats.average_offering)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Par quête
                    </p>
                  </CardContent>
                </Card>

                {/* Total Attendance */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Présents</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {displayStats.total_attendees}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Personnes
                    </p>
                  </CardContent>
                </Card>

                {/* Semaine */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Semaine</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {`${new Date(displayStats.week_start).toLocaleDateString('fr-FR')} - ${new Date(displayStats.week_end).toLocaleDateString('fr-FR')}`}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Semaine actuelle
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Info Message */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-slate-900">À propos de votre section</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                <p>
                  Ce tableau de bord affiche uniquement les données de votre section.
                  Vous pouvez créer des rapports, consulter vos rapports précédents et
                  modifier les données si nécessaire.
                </p>
              </CardContent>
            </Card>

            {/* Tableau détaillé de tous les rapports */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tous les rapports de votre section</CardTitle>
                    <CardDescription>Tableau professionnel avec toutes les colonnes</CardDescription>
                  </div>
                  {reports.length > 0 && (
                    <Button
                      onClick={handleDownloadAllReports}
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger tous les rapports
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center text-slate-500">Chargement des rapports...</div>
                ) : reports.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    Aucun rapport enregistré pour votre section
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                          <th className="py-3 px-4 text-left font-semibold border border-blue-800">Date</th>
                          <th className="py-3 px-4 text-left font-semibold border border-blue-800">Prédicateur</th>
                          <th className="py-3 px-4 text-right font-semibold border border-blue-800">Total</th>
                          <th className="py-3 px-4 text-right font-semibold border border-blue-800">👨 Hommes</th>
                          <th className="py-3 px-4 text-right font-semibold border border-blue-800">👩 Femmes</th>
                          <th className="py-3 px-4 text-right font-semibold border border-blue-800">👧 Enfants</th>
                          <th className="py-3 px-4 text-right font-semibold border border-blue-800">🧑 Jeunes</th>
                          <th className="py-3 px-4 text-right font-semibold border border-blue-800">💰 Offrande</th>
                          <th className="py-3 px-4 text-center font-semibold border border-blue-800">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report, idx) => (
                          <tr
                            key={report.id}
                            className={`${
                              idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            } border-b border-slate-200 hover:bg-blue-50 transition`}
                          >
                            <td className="py-3 px-4 border border-slate-200">
                              {new Date(report.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-4 border border-slate-200 font-medium">
                              {report.preacher}
                            </td>
                            <td className="py-3 px-4 text-right border border-slate-200 font-bold text-blue-600">
                              {report.total_attendees}
                            </td>
                            <td className="py-3 px-4 text-right border border-slate-200 text-blue-500 font-medium">
                              {report.men}
                            </td>
                            <td className="py-3 px-4 text-right border border-slate-200 text-pink-500 font-medium">
                              {report.women}
                            </td>
                            <td className="py-3 px-4 text-right border border-slate-200 text-green-500 font-medium">
                              {report.children}
                            </td>
                            <td className="py-3 px-4 text-right border border-slate-200 text-amber-500 font-medium">
                              {report.youth}
                            </td>
                            <td className="py-3 px-4 text-right border border-slate-200 font-bold text-amber-600">
                              {(report.offering).toLocaleString('fr-FR')} XOF
                            </td>
                            <td className="py-3 px-4 text-center border border-slate-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReport(report)}
                                disabled={downloadingId === report.id}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Résumé */}
                    {reports.length > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-200 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">Total Rapports</p>
                            <p className="text-xl font-bold text-slate-900">{reports.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">Total Fidèles</p>
                            <p className="text-xl font-bold text-blue-600">
                              {reports.reduce((sum, r) => sum + (r.total_attendees || 0), 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">Offrande Totale</p>
                            <p className="text-xl font-bold text-amber-600">
                              {reports.reduce((sum, r) => sum + (r.offering || 0), 0).toLocaleString('fr-FR')} XOF
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">Moyenne par Rapport</p>
                            <p className="text-xl font-bold text-green-600">
                              {(reports.reduce((sum, r) => sum + (r.offering || 0), 0) / reports.length).toLocaleString('fr-FR')} XOF
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Report Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Créer un nouveau rapport</CardTitle>
                <CardDescription>
                  Enregistrez les données de quête de votre section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportForm onSuccess={() => setActiveTab('reports')} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports de votre section</CardTitle>
                <CardDescription>
                  Tous les rapports que vous avez entrés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsDataTable 
                  title="Mes Rapports" 
                  description="Liste de tous vos rapports"
                  isAdmin={false}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des rapports</CardTitle>
                <CardDescription>
                  Consultez vos rapports archivés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsDataTable 
                  title="Historique" 
                  description="Vos rapports antérieurs"
                  isAdmin={false}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionDashboardPage;
