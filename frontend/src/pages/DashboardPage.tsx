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
      const sectionReports = reportsBySection.get(sectionId) || [];
      const combinedBlob = await reportService.exportPDF(sectionReports);
      const url = window.URL.createObjectURL(combinedBlob);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
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
              <h1 className="text-4xl font-bold text-gray-900">Tableau de Bord Admin</h1>
              <p className="text-lg text-gray-600">
                Vue d'ensemble de tous les rapports et statistiques
              </p>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des rapports: {error instanceof Error ? error.message : 'Erreur inconnue'}
            </AlertDescription>
          </Alert>
        )}

        {/* Cartes de statistiques */}
        {isLoading ? (
          <div className="text-center text-gray-500">Chargement des statistiques...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Rapports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rapports</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReports}</div>
                <p className="text-xs text-gray-500 mt-1">rapports enregistrés</p>
              </CardContent>
            </Card>

            {/* Total Fidèles */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fidèles</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFaithful.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">personnes</p>
              </CardContent>
            </Card>

            {/* Total Offrande */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Offrande</CardTitle>
                <DollarSign className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.totalOffering).toLocaleString('fr-FR')}
                </div>
                <p className="text-xs text-gray-500 mt-1">XOF</p>
              </CardContent>
            </Card>

            {/* Sections Actives */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sections Actives</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSections}</div>
                <p className="text-xs text-gray-500 mt-1">sections</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rapports par Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Rapports par Section</h2>
          {isLoading ? (
            <div className="text-center text-gray-500">Chargement...</div>
          ) : reportsBySection.size === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">Aucun rapport enregistré</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Array.from(reportsBySection.entries()).map(([sectionId, sectionReports]) => {
                const isExpanded = expandedSections.has(sectionId);
                const sectionOffering = sectionReports.reduce((sum, r) => sum + (r.offering || 0), 0);
                const sectionAttendees = sectionReports.reduce((sum, r) => sum + (r.total_attendees || 0), 0);
                
                return (
                  <Card key={sectionId}>
                    <div
                      onClick={() => toggleSection(sectionId)}
                      className="cursor-pointer p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {sectionId}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Section {sectionId}</h3>
                          <p className="text-sm text-gray-600">
                            {sectionReports.length} rapport{sectionReports.length > 1 ? 's' : ''} | 
                            {' '}{sectionAttendees.toLocaleString()} fidèles | 
                            {' '}{sectionOffering.toLocaleString('fr-FR')} XOF
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSectionReports(sectionId);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <CardContent className="border-t border-gray-200 pt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold">Date</th>
                                <th className="text-left py-3 px-4 font-semibold">Prédicateur</th>
                                <th className="text-right py-3 px-4 font-semibold">Fidèles</th>
                                <th className="text-right py-3 px-4 font-semibold">Hommes</th>
                                <th className="text-right py-3 px-4 font-semibold">Femmes</th>
                                <th className="text-right py-3 px-4 font-semibold">Enfants</th>
                                <th className="text-right py-3 px-4 font-semibold">Jeunes</th>
                                <th className="text-right py-3 px-4 font-semibold">Offrande</th>
                                <th className="text-center py-3 px-4 font-semibold">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sectionReports.map((report, idx) => (
                                <tr
                                  key={report.id}
                                  className={`${
                                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  } border-b border-gray-200 hover:bg-gray-100`}
                                >
                                  <td className="py-3 px-4">
                                    {new Date(report.date).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td className="py-3 px-4">{report.preacher}</td>
                                  <td className="py-3 px-4 text-right font-medium text-blue-600">
                                    {report.total_attendees}
                                  </td>
                                  <td className="py-3 px-4 text-right text-blue-500">
                                    {report.men}
                                  </td>
                                  <td className="py-3 px-4 text-right text-pink-500">
                                    {report.women}
                                  </td>
                                  <td className="py-3 px-4 text-right text-green-500">
                                    {report.children}
                                  </td>
                                  <td className="py-3 px-4 text-right text-amber-500">
                                    {report.youth}
                                  </td>
                                  <td className="py-3 px-4 text-right text-amber-600 font-medium">
                                    {(report.offering).toLocaleString('fr-FR')} XOF
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadReport(report)}
                                      disabled={downloadingId === report.id}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Download className="h-4 w-4" />
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
