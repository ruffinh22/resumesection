import React, { useState, useEffect } from 'react';
import { reportService, Report } from '../api/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
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
      // Charger tous les rapports si admin, sinon ses rapports
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

  // Grouper les rapports par section
  const reportsBySection = reports.reduce((acc, report) => {
    if (!acc[report.section_id]) {
      acc[report.section_id] = [];
    }
    acc[report.section_id].push(report);
    return acc;
  }, {} as Record<number, Report[]>);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Export PDF</h1>
        <p className="text-gray-600">
          Téléchargez les rapports et statistiques de votre église
        </p>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Chargement des rapports...</p>
          </div>
        </div>
      ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Export Global</TabsTrigger>
            <TabsTrigger value="sections">Par Section</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
          </TabsList>

          {/* TAB 1: Export Global */}
          <TabsContent value="global" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Global Complet
                </CardTitle>
                <CardDescription>
                  Téléchargez un rapport PDF avec tous les rapports et sections alignés verticalement dans un tableau
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Contenu du rapport:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Tous les rapports de toutes les sections</li>
                    <li>✅ Tableau complet avec: Date, Section, Prédicateur, Fidèles, Offrande</li>
                    <li>✅ Total général des offrandes</li>
                    <li>✅ Statistiques globales</li>
                  </ul>
                </div>

                <Button
                  onClick={() => downloadPDF('global')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger Rapport Global (PDF)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Par Section */}
          <TabsContent value="sections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(reportsBySection).map(([sectionId, sectionReports]) => (
                <Card key={sectionId}>
                  <CardHeader>
                    <CardTitle className="text-lg">Section {sectionId}</CardTitle>
                    <CardDescription>
                      {sectionReports.length} rapport{sectionReports.length > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p className="text-gray-600">
                        <strong>Total offrandes:</strong>{' '}
                        <span className="text-green-700 font-semibold">
                          {formatCurrency(
                            sectionReports.reduce((sum, r) => sum + r.offering, 0)
                          )}
                        </span>
                      </p>
                      <p className="text-gray-600 mt-1">
                        <strong>Fidèles:</strong>{' '}
                        <span className="font-semibold">
                          {sectionReports.reduce((sum, r) => sum + r.total_attendees, 0)}
                        </span>
                      </p>
                    </div>

                    <Button
                      onClick={() => downloadPDF('section', parseInt(sectionId))}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: Historique des Rapports */}
          <TabsContent value="historique" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique Complet des Rapports</CardTitle>
                <CardDescription>
                  Tous les rapports avec options de téléchargement individuels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-gray-700">Date</TableHead>
                        <TableHead className="text-gray-700">Section</TableHead>
                        <TableHead className="text-gray-700">Prédicateur</TableHead>
                        <TableHead className="text-gray-700 text-right">Fidèles</TableHead>
                        <TableHead className="text-gray-700 text-right">Offrande</TableHead>
                        <TableHead className="text-gray-700 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {formatDate(report.date)}
                          </TableCell>
                          <TableCell>Section {report.section_id}</TableCell>
                          <TableCell>{report.preacher}</TableCell>
                          <TableCell className="text-right">
                            {report.total_attendees}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-700">
                            {formatCurrency(report.offering)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              onClick={() => downloadPDF('report', undefined, report.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    Aucun rapport disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ExportPage;