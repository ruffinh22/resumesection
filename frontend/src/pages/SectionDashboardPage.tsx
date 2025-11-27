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
      {/* Header - Responsive */}
      <div className="bg-white shadow sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <img 
                src={getLogoUrl('compact')} 
                alt="Logo Église Évangélique" 
                className="h-10 sm:h-12 lg:h-16 w-10 sm:w-12 lg:w-16 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                  Tableau de Bord
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">
                  Bienvenue {user.username}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto justify-center text-xs sm:text-base"
            >
              <LogOut className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Déco</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        
        {/* Navigation Tabs - Responsive */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-8 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto">
          <Button
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0"
          >
            <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">Statistiques</span>
            <span className="sm:hidden">Stats</span>
          </Button>
          <Button
            onClick={() => setActiveTab('create')}
            variant={activeTab === 'create' ? 'default' : 'outline'}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0"
          >
            <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">Créer</span>
            <span className="sm:hidden">+</span>
          </Button>
          <Button
            onClick={() => setActiveTab('reports')}
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0"
          >
            <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">Rapports</span>
            <span className="sm:hidden">Voir</span>
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0"
          >
            <History className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">Historique</span>
            <span className="sm:hidden">Hist</span>
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
                  <div className="text-center text-slate-500 text-sm">
                    Chargement des statistiques...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {/* Total Quetes */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Quêtes</CardTitle>
                    <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="text-base sm:text-2xl font-bold break-words">
                      {formatCFA(displayStats.total_offering)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {displayStats.total_services} quête{displayStats.total_services !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                {/* Moyenne par Quete */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">Moyenne</CardTitle>
                    <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="text-base sm:text-2xl font-bold break-words">
                      {formatCFA(displayStats.average_offering)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Par quête
                    </p>
                  </CardContent>
                </Card>

                {/* Total Attendance */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">Présents</CardTitle>
                    <Users className="h-3 sm:h-4 w-3 sm:w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="text-lg sm:text-2xl font-bold">
                      {displayStats.total_attendees}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Personnes
                    </p>
                  </CardContent>
                </Card>

                {/* Semaine */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">Semaine</CardTitle>
                    <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="text-sm sm:text-xl font-bold line-clamp-2">
                      {`${new Date(displayStats.week_start).toLocaleDateString('fr-FR', {year: '2-digit', month: '2-digit', day: '2-digit'})} - ${new Date(displayStats.week_end).toLocaleDateString('fr-FR', {year: '2-digit', month: '2-digit', day: '2-digit'})}`}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Semaine actuelle
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Info Message */}
            <Card className="bg-blue-50 border-blue-200 overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-slate-900">À propos de votre section</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 text-slate-600 text-sm">
                <p>
                  Ce tableau de bord affiche uniquement les données de votre section.
                  Vous pouvez créer des rapports, consulter vos rapports précédents et
                  modifier les données si nécessaire.
                </p>
              </CardContent>
            </Card>

            {/* Tableau détaillé de tous les rapports */}
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg">Tous les rapports</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Tableau professionnel avec toutes les colonnes</CardDescription>
                  </div>
                  {reports.length > 0 && (
                    <Button
                      onClick={handleDownloadAllReports}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Télécharger tous</span>
                      <span className="sm:hidden">Télécharger</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                {reportsLoading ? (
                  <div className="text-center text-slate-500 text-sm py-4">Chargement des rapports...</div>
                ) : reports.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-8">
                    Aucun rapport enregistré
                  </div>
                ) : (
                  <>
                    {/* Mobile: Cartes */}
                    <div className="sm:hidden space-y-2">
                      {reports.map((report) => (
                        <div key={report.id} className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-2 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-600">📅 Date</p>
                              <p className="text-xs font-bold">{new Date(report.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                              disabled={downloadingId === report.id}
                              className="text-blue-600 hover:bg-blue-100 h-7 px-2 py-1 flex items-center gap-1 text-xs"
                            >
                              <Download className="h-3 w-3" />
                              <span>DL</span>
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>
                              <p className="font-semibold text-slate-600">🎤 Prédicateur</p>
                              <p className="font-medium truncate">{report.preacher}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-600">👥 Total</p>
                              <p className="font-bold text-blue-600">{report.total_attendees}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-600">👨 Hommes</p>
                              <p className="text-blue-500 font-bold">{report.men}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-600">👩 Femmes</p>
                              <p className="text-pink-500 font-bold">{report.women}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-600">👧 Enfants</p>
                              <p className="text-green-500 font-bold">{report.children}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-600">🧑 Jeunes</p>
                              <p className="text-amber-500 font-bold">{report.youth}</p>
                            </div>
                          </div>
                          <div className="border-t border-slate-300 pt-1">
                            <p className="font-semibold text-slate-600 text-xs">💰 Offrande</p>
                            <p className="font-bold text-amber-600 text-sm">{Math.round(report.offering / 1000)}K XOF</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop & Tablet: Table avec scroll */}
                    <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-xs lg:text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0">
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold whitespace-nowrap">📅 Date</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold whitespace-nowrap">🎤 Prédicateur</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap">👥 Total</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap hidden lg:table-cell">👨 Hommes</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap hidden lg:table-cell">👩 Femmes</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap hidden lg:table-cell">👧 Enfants</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap hidden lg:table-cell">🧑 Jeunes</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap">💰 Offrande</th>
                            <th className="py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold whitespace-nowrap hidden sm:table-cell">⬇️ Action</th>
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
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm whitespace-nowrap">
                                {new Date(report.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 font-medium text-xs lg:text-sm truncate max-w-xs">
                                {report.preacher}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-right font-bold text-blue-600 text-xs lg:text-sm whitespace-nowrap">
                                {report.total_attendees}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-blue-500 font-medium text-xs lg:text-sm whitespace-nowrap hidden lg:table-cell">
                                {report.men}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-pink-500 font-medium text-xs lg:text-sm whitespace-nowrap hidden lg:table-cell">
                                {report.women}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-green-500 font-medium text-xs lg:text-sm whitespace-nowrap hidden lg:table-cell">
                                {report.children}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-amber-500 font-medium text-xs lg:text-sm whitespace-nowrap hidden lg:table-cell">
                                {report.youth}
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-right font-bold text-amber-600 text-xs lg:text-sm whitespace-nowrap">
                                {Math.round(report.offering / 1000)}K XOF
                              </td>
                              <td className="py-2 lg:py-3 px-2 lg:px-4 text-center hidden sm:table-cell">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadReport(report)}
                                  disabled={downloadingId === report.id}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 px-2 py-1 flex items-center gap-1 text-xs mx-auto"
                                  title="Télécharger le rapport"
                                >
                                  <Download className="h-3 lg:h-4 w-3 lg:w-4" />
                                  <span className="hidden lg:inline">Télécharger</span>
                                  <span className="lg:hidden">DL</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Résumé - Responsive */}
                    {reports.length > 0 && (
                      <div className="mt-4 sm:mt-6 p-2 sm:p-4 bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                          <div className="min-w-0">
                            <p className="text-xs text-slate-600 font-semibold truncate">Rapports</p>
                            <p className="text-base sm:text-xl font-bold text-slate-900 truncate">{reports.length}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-600 font-semibold truncate">Fidèles</p>
                            <p className="text-base sm:text-xl font-bold text-blue-600 truncate">
                              {reports.reduce((sum, r) => sum + (r.total_attendees || 0), 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-600 font-semibold truncate">Offrande</p>
                            <p className="text-xs sm:text-base lg:text-xl font-bold text-amber-600 truncate">
                              {Math.round(reports.reduce((sum, r) => sum + (r.offering || 0), 0) / 1000)}K XOF
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-600 font-semibold truncate">Moyenne</p>
                            <p className="text-xs sm:text-base lg:text-xl font-bold text-green-600 truncate">
                              {Math.round(reports.reduce((sum, r) => sum + (r.offering || 0), 0) / reports.length / 1000)}K XOF
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Report Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Créer un nouveau rapport</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enregistrez les données de quête de votre section
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <ReportForm onSuccess={() => setActiveTab('reports')} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Rapports de votre section</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tous les rapports que vous avez entrés
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
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
          <div className="space-y-4 sm:space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Historique des rapports</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Consultez vos rapports archivés
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
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
