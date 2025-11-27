import React, { useState, useEffect } from 'react';
import { reportService, Report } from '../api/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Download, FileText, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';

const ExportPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('global');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (user?.role === 'admin') {
        const data = await reportService.getSummary();
        setReports(data);
      } else {
        const data = await reportService.getMyReports();
        setReports(data);
      }
    } catch (err: any) {
      setError(err.msg || 'Erreur lors du chargement des rapports');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = (type: 'global' | 'section' | 'report', sectionId?: number, reportId?: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Veuillez vous connecter');
      return;
    }

    let url = 'http://127.0.0.1:5000/';

    if (type === 'global') {
      url += `summary/pdf?token=${encodeURIComponent(token)}`;
    } else if (type === 'section' && sectionId) {
      url += `section-report/pdf?section_id=${sectionId}&token=${encodeURIComponent(token)}`;
    } else if (type === 'report' && reportId) {
      url += `report/pdf?report_id=${reportId}&token=${encodeURIComponent(token)}`;
    }

    window.open(url, '_blank');
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(0)} XOF`;
  };

  const reportsBySection = reports.reduce((acc, report) => {
    if (!acc[report.section_id]) {
      acc[report.section_id] = [];
    }
    acc[report.section_id].push(report);
    return acc;
  }, {} as Record<number, Report[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4 lg:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
            📥 Export PDF
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">
            Téléchargez les rapports et statistiques de votre église
          </p>
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-600" />
            <AlertDescription className="text-xs sm:text-sm text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <Loader className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-slate-600">⏳ Chargement des rapports...</p>
            </div>
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full space-y-3 sm:space-y-4">
            <TabsList className="grid w-full grid-cols-3 gap-1.5 sm:gap-2 p-1 sm:p-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg border border-slate-200 h-auto">
              <TabsTrigger
                value="global"
                className="py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-300 text-slate-600 hover:text-slate-900 hover:bg-white/50"
              >
                📊 Global
              </TabsTrigger>
              <TabsTrigger
                value="sections"
                className="py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-300 text-slate-600 hover:text-slate-900 hover:bg-white/50"
              >
                🗂️ Sections
              </TabsTrigger>
              <TabsTrigger
                value="historique"
                className="py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-orange-300 text-slate-600 hover:text-slate-900 hover:bg-white/50"
              >
                📋 Historique
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Export Global */}
            <TabsContent value="global" className="space-y-2 sm:space-y-3 lg:space-y-4">
              <Card className="overflow-hidden border border-slate-200 shadow-sm">
                <CardHeader className="p-3 sm:p-4 lg:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base lg:text-lg font-bold text-slate-900">
                    <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 flex-shrink-0" />
                    Export Global Complet
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">
                    PDF avec tous les rapports et sections compilés
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 lg:p-4 text-xs sm:text-sm">
                    <h3 className="font-bold text-blue-900 mb-1.5 sm:mb-2 flex items-center gap-1">
                      📊 Contenu du rapport:
                    </h3>
                    <ul className="text-blue-800 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold mt-0.5">✅</span>
                        <span>Tous les rapports de toutes les sections</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold mt-0.5">✅</span>
                        <span>Tableau complet (Date, Section, Prédicateur, Fidèles, Offrande)</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold mt-0.5">✅</span>
                        <span>Total général des offrandes</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold mt-0.5">✅</span>
                        <span>Statistiques et analyse complètes</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => downloadPDF('global')}
                    className="w-full h-9 sm:h-10 lg:h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs sm:text-sm lg:text-base font-semibold rounded-lg transition shadow-sm"
                  >
                    <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span>📄 Télécharger Rapport Global</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Par Section */}
            <TabsContent value="sections" className="space-y-2 sm:space-y-3 lg:space-y-4">
              {Object.entries(reportsBySection).length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs sm:text-sm text-slate-600">ℹ️ Aucune section disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                  {Object.entries(reportsBySection).map(([sectionId, sectionReports]) => (
                    <Card key={sectionId} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition">
                      <CardHeader className="p-3 sm:p-4 lg:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50">
                        <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                          📌 Section {sectionId}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-600 mt-1">
                          {sectionReports.length} rapport{sectionReports.length > 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
                        <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg p-2.5 sm:p-3 space-y-1.5 sm:space-y-2 border border-purple-200">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-slate-600 font-medium">💰 Total offrandes:</span>
                            <span className="font-bold text-green-700 text-sm sm:text-base">
                              {formatCurrency(
                                sectionReports.reduce((sum, r) => sum + r.offering, 0)
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-slate-600 font-medium">👥 Fidèles:</span>
                            <span className="font-bold text-blue-700 text-sm">
                              {sectionReports.reduce((sum, r) => sum + r.total_attendees, 0)}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => downloadPDF('section', parseInt(sectionId))}
                          className="w-full h-8 sm:h-9 lg:h-10 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition"
                        >
                          <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 flex-shrink-0" />
                          <span>Télécharger</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: Historique des Rapports */}
            <TabsContent value="historique" className="space-y-2 sm:space-y-3 lg:space-y-4">
              <Card className="overflow-hidden border border-slate-200 shadow-sm">
                <CardHeader className="p-3 sm:p-4 lg:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-orange-50">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    📋 Historique Complet
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-600 mt-1">
                    Tous les rapports avec options de téléchargement individuels
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {reports.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <p className="text-xs sm:text-sm text-slate-600">ℹ️ Aucun rapport disponible</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile: Cartes */}
                      <div className="sm:hidden space-y-1.5">
                        {reports.map((report) => (
                          <div key={report.id} className="bg-gradient-to-r from-slate-50 to-orange-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-600 font-medium truncate">📅 {formatDate(report.date)}</p>
                                <p className="text-xs font-bold text-slate-900 truncate">📌 Section {report.section_id}</p>
                              </div>
                              <Button
                                onClick={() => downloadPDF('report', undefined, report.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 py-1 flex items-center gap-0.5 text-xs flex-shrink-0 rounded-md"
                              >
                                <Download className="h-3 w-3" />
                                <span>DL</span>
                              </Button>
                            </div>
                            <div className="space-y-1 text-xs border-t border-slate-200 pt-1.5">
                              <div>
                                <p className="text-slate-600 font-medium">🎤 Prédicateur</p>
                                <p className="font-medium truncate">{report.preacher}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <p className="text-slate-600 font-medium">👥 Fidèles</p>
                                  <p className="font-bold text-blue-600">{report.total_attendees}</p>
                                </div>
                                <div>
                                  <p className="text-slate-600 font-medium">💰 Offrande</p>
                                  <p className="font-bold text-green-700 text-xs">{formatCurrency(report.offering)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop: Table */}
                      <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-xs lg:text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-orange-600 to-orange-700 text-white sticky top-0">
                              <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold whitespace-nowrap">📅 Date</th>
                              <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold whitespace-nowrap">📌 Section</th>
                              <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold whitespace-nowrap">🎤 Prédicateur</th>
                              <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap">👥 Fidèles</th>
                              <th className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold whitespace-nowrap">💰 Offrande</th>
                              <th className="py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold whitespace-nowrap">⬇️ Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map((report, idx) => (
                              <tr
                                key={report.id}
                                className={`${
                                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                } border-b border-slate-200 hover:bg-orange-50 transition`}
                              >
                                <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm whitespace-nowrap font-medium text-slate-900">
                                  {formatDate(report.date)}
                                </td>
                                <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm font-bold text-slate-900">
                                  Section {report.section_id}
                                </td>
                                <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm truncate max-w-xs font-medium text-slate-700">
                                  {report.preacher}
                                </td>
                                <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-xs lg:text-sm font-bold text-blue-600 whitespace-nowrap">
                                  {report.total_attendees}
                                </td>
                                <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-xs lg:text-sm font-bold text-green-700 whitespace-nowrap">
                                  {formatCurrency(report.offering)}
                                </td>
                                <td className="py-2 lg:py-3 px-2 lg:px-4 text-center">
                                  <Button
                                    onClick={() => downloadPDF('report', undefined, report.id)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 py-1 flex items-center gap-1 text-xs mx-auto rounded-md"
                                    title="Télécharger le rapport"
                                  >
                                    <Download className="h-3 lg:h-4 w-3 lg:w-4 flex-shrink-0" />
                                    <span className="hidden lg:inline">DL</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ExportPage;
