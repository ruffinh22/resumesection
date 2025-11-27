import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService, type Report } from '../api/reports';
import { useAuth } from '../components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, TrendingUp, Users, DollarSign, BarChart3, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getLogoUrl } from '../utils/assets';

const DashboardPage: React.FC = () => {
  const { user, token, error: authError } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  
  // Déterminer si on est en mode démo (token mock)
  const isDemoMode = token && token.includes(':') && !token.includes('.');
  
  // Récupérer les rapports depuis l'API
  const { data: reports = [], isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => {
      console.log('Fetching summary reports for user:', user, 'Demo mode:', isDemoMode);
      if (!user || user.role !== 'admin') {
        console.warn('User is not admin:', user?.role);
        throw new Error('User is not admin');
      }
      
      // En mode démo, retourner des données vides ou mock
      if (isDemoMode) {
        console.warn('Demo mode: returning empty data');
        return [];
      }
      
      return reportService.getSummary();
    },
    retry: isDemoMode ? 0 : 1,
    enabled: user?.role === 'admin',
  });

  // Log errors
  React.useEffect(() => {
    if (error) {
      console.error('Query error:', error);
    }
  }, [error]);

  // Grouper les rapports par section
  const reportsBySection = React.useMemo(() => {
    const grouped: Map<number, Report[]> = new Map();
    
    [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(report => {
      const sectionId = report.section_id;
      if (!grouped.has(sectionId)) {
        grouped.set(sectionId, []);
      }
      grouped.get(sectionId)!.push(report);
    });
    
    return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]));
  }, [reports]);

  // Calculer les statistiques à partir des rapports
  const stats = React.useMemo(() => {
    if (reports.length === 0) {
      return {
        totalReports: 0,
        totalFaithful: 0,
        totalOffering: 0,
        activeSections: 0,
      };
    }

    const totalReports = reports.length;
    const totalFaithful = reports.reduce((sum, r) => sum + (r.total_attendees || 0), 0);
    const totalOffering = reports.reduce((sum, r) => sum + (r.offering || 0), 0);
    const activeSections = new Set(reports.map(r => r.section_id)).size;

    return { totalReports, totalFaithful, totalOffering, activeSections };
  }, [reports]);

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
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

  const handleDownloadSectionReports = async (sectionId: number) => {
    try {
      // Télécharger en utilisant l'endpoint PDF global
      const blob = await reportService.exportPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-section-${sectionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erreur lors du téléchargement des rapports');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100">
      {/* Header - Sticky Premium avec Z-index élevé (mais inférieur à sidebar mobile z-40) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg sticky top-0 z-30 border-b border-slate-700 lg:z-50">
        <div className="w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-5 lg:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto flex-1">
              <img 
                src={getLogoUrl('compact')} 
                alt="Logo Église Évangélique" 
                className="h-10 sm:h-12 lg:h-14 w-10 sm:w-12 lg:w-14 flex-shrink-0 rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white truncate">
                  📊 Tableau de Bord Admin
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sous-titre sticky - Fixe avec le header */}
        <div className="w-full px-3 sm:px-4 lg:px-8 py-2 sm:py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-t border-slate-600">
          <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            Vue d'ensemble complète des rapports
          </p>
        </div>
      </div>

      {/* Main Content - avec padding top pour éviter overlap */}
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
        {/* Messages d'erreur */}
        {isError && (
          <Alert variant="destructive" className="mb-4 sm:mb-6 border-2 shadow-md">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              ❌ Erreur: {error instanceof Error ? error.message : 'Erreur inconnue'}
            </AlertDescription>
          </Alert>
        )}

        {/* Cartes de statistiques - Responsive & Premium */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">⏳ Chargement des statistiques...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
            {/* Total Rapports */}
            <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 lg:p-5 pb-1 sm:pb-2 bg-gradient-to-r from-blue-50 to-slate-50">
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-700">📋 Rapports</CardTitle>
                <BarChart3 className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-5 pt-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">{stats.totalReports}</div>
                <p className="text-xs text-slate-600 mt-1 font-medium">enregistrés</p>
              </CardContent>
            </Card>

            {/* Total Fidèles */}
            <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 lg:p-5 pb-1 sm:pb-2 bg-gradient-to-r from-green-50 to-slate-50">
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-700">👥 Fidèles</CardTitle>
                <Users className="h-5 sm:h-6 w-5 sm:w-6 text-green-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-5 pt-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700">{stats.totalFaithful.toLocaleString()}</div>
                <p className="text-xs text-slate-600 mt-1 font-medium">personnes</p>
              </CardContent>
            </Card>

            {/* Total Offrande */}
            <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 lg:p-5 pb-1 sm:pb-2 bg-gradient-to-r from-amber-50 to-slate-50">
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-700">💰 Offrande</CardTitle>
                <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-amber-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-5 pt-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-700">
                  {Math.round(stats.totalOffering / 1000)}K
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">XOF</p>
              </CardContent>
            </Card>

            {/* Sections Actives */}
            <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 lg:p-5 pb-1 sm:pb-2 bg-gradient-to-r from-purple-50 to-slate-50">
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-700">⛪ Sections</CardTitle>
                <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-5 pt-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700">{stats.activeSections}</div>
                <p className="text-xs text-slate-600 mt-1 font-medium">actives</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rapports par Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
              📑 Rapports par Section
            </h2>
            <span className="text-xs sm:text-sm font-semibold bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 rounded-full">
              {reportsBySection.size}
            </span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-slate-600 text-sm">⏳ Chargement...</div>
            </div>
          ) : reportsBySection.size === 0 ? (
            <Card className="border-2 border-dashed border-slate-300">
              <CardContent className="py-12 text-center text-slate-600 text-sm">
                ℹ️ Aucun rapport enregistré
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {Array.from(reportsBySection.entries()).map(([sectionId, sectionReports]) => {
                const isExpanded = expandedSections.has(sectionId);
                const sectionOffering = sectionReports.reduce((sum, r) => sum + (r.offering || 0), 0);
                const sectionAttendees = sectionReports.reduce((sum, r) => sum + (r.total_attendees || 0), 0);
                
                return (
                  <Card key={sectionId} className="overflow-visible border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div
                      onClick={() => toggleSection(sectionId)}
                      className="cursor-pointer p-3 sm:p-4 lg:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-indigo-50/50 gap-3 sm:gap-4 transition"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow-md">
                          {sectionId}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            Section {sectionId}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                            <span className="sm:hidden">
                              {sectionReports.length}r • {sectionAttendees}👥 • {Math.round(sectionOffering / 1000)}K💰
                            </span>
                            <span className="hidden sm:inline">
                              {sectionReports.length} rapport{sectionReports.length > 1 ? 's' : ''} | 
                              {' '}{sectionAttendees} fidèles | 
                              {' '}{Math.round(sectionOffering / 1000)}K XOF
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSectionReports(sectionId);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 hidden sm:flex gap-1.5 items-center border-indigo-200 font-medium"
                        >
                          <Download className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                          <span>Télécharger</span>
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 sm:h-6 w-5 sm:w-6 text-slate-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <CardContent className="border-t border-slate-200 pt-2 sm:pt-4 p-2 sm:p-4 relative z-0 overflow-hidden">
                        {/* Mobile: Cartes */}
                        <div className="sm:hidden space-y-2">
                          {sectionReports.map((report) => (
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
                              {sectionReports.map((report, idx) => (
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
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
