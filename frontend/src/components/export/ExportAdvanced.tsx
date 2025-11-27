import React, { useState, useEffect } from 'react';
import { reportService, Report } from '../../api/reports';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Download, FileText, AlertCircle, Loader } from 'lucide-react';

interface Section {
  id: number;
  name: string;
  reportCount: number;
  totalOffering: number;
  totalAttendees: number;
}

/**
 * Composant d'export PDF avancé avec 3 onglets
 */
export const ExportAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'section' | 'history'>('global');
  const [reports, setReports] = useState<Report[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les rapports au montage
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await reportService.getSummary();
        setReports(data);

        // Calculer les statistiques par section
        const sectionMap = new Map<number, Section>();
        data.forEach((report) => {
          const sid = report.section_id;
          if (!sectionMap.has(sid)) {
            sectionMap.set(sid, {
              id: sid,
              name: `Section ${sid}`,
              reportCount: 0,
              totalOffering: 0,
              totalAttendees: 0,
            });
          }
          const section = sectionMap.get(sid)!;
          section.reportCount++;
          section.totalOffering += report.offering || 0;
          section.totalAttendees += report.total_attendees || 0;
        });

        setSections(Array.from(sectionMap.values()));
      } catch (err: any) {
        setError(err.msg || 'Erreur lors du chargement des rapports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleExportGlobal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Veuillez vous connecter');
      return;
    }
    const url = `http://127.0.0.1:5000/summary/pdf?token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  };

  const handleExportSection = (sectionId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Veuillez vous connecter');
      return;
    }
    const url = `http://127.0.0.1:5000/section-report/pdf?section_id=${sectionId}&token=${encodeURIComponent(
      token
    )}`;
    window.open(url, '_blank');
  };

  const handleExportReport = (reportId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Veuillez vous connecter');
      return;
    }
    const url = `http://127.0.0.1:5000/report/pdf?report_id=${reportId}&token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  };

  const formatCFA = (amount: number): string => {
    return `${amount.toFixed(0)} XOF`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'global'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Export Global
        </button>
        <button
          onClick={() => setActiveTab('section')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'section'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏢 Par Section
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📜 Historique
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'global' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Global
            </CardTitle>
            <CardDescription>
              Téléchargez tous les rapports de toutes les sections dans un tableau complet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 mb-3">
                ✅ Contient tous les rapports<br/>
                ✅ Tableau formaté<br/>
                ✅ Totaux par section<br/>
                ✅ Grand total général
              </p>
            </div>
            <Button onClick={handleExportGlobal} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF Complet
            </Button>
            <p className="text-xs text-gray-500">
              {reports.length} rapport(s) | {sections.length} section(s)
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'section' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 Par Section
              </CardTitle>
              <CardDescription>
                Téléchargez les rapports d'une section spécifique
              </CardDescription>
            </CardHeader>
          </Card>

          {sections.length === 0 ? (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Aucune section disponible
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section) => (
                <Card key={section.id} className="hover:shadow-lg transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{section.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">{section.reportCount}</span> rapport(s)
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">{section.totalAttendees}</span> fidèle(s)
                      </p>
                      <p className="text-green-700 font-semibold">
                        {formatCFA(section.totalOffering)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleExportSection(section.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Télécharger
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📜 Historique Complet
            </CardTitle>
            <CardDescription>
              Tous les rapports avec option de téléchargement individuel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Aucun rapport disponible
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Section</th>
                      <th className="px-4 py-2 text-left">Prédicateur</th>
                      <th className="px-4 py-2 text-right">Fidèles</th>
                      <th className="px-4 py-2 text-right">Offrande</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{formatDate(report.date)}</td>
                        <td className="px-4 py-2 text-gray-700">Section {report.section_id}</td>
                        <td className="px-4 py-2 text-gray-700">{report.preacher}</td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {report.total_attendees}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-green-700">
                          {formatCFA(report.offering)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleExportReport(report.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium"
                          >
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExportAdvanced;
