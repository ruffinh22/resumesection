import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Calendar, CheckCircle } from 'lucide-react';
import { getReports } from '../../utils/storage';
import { generatePDF } from '../../utils/pdf';

export const ExportPDF: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exportConfig, setExportConfig] = useState({
    startDate: '',
    endDate: '',
    section: 'all',
    includeStats: true,
    includeDetails: true,
    includeNotes: false
  });

  const reports = getReports();
  const sections = [...new Set(reports.map(report => report.sectionName))];

  const handleExport = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    try {
      let filteredReports = reports;

      if (exportConfig.startDate) {
        filteredReports = filteredReports.filter(
          report => report.date >= exportConfig.startDate
        );
      }

      if (exportConfig.endDate) {
        filteredReports = filteredReports.filter(
          report => report.date <= exportConfig.endDate
        );
      }

      if (exportConfig.section !== 'all') {
        filteredReports = filteredReports.filter(
          report => report.sectionName === exportConfig.section
        );
      }

      // If we have a server token, request the PDF from backend and open
      // it in a new tab so the browser handles download/open.
      const token = localStorage.getItem('token') || '';
      if (token) {
        const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://127.0.0.1:5000';
        const params = new URLSearchParams();
        if (exportConfig.startDate) params.append('start', exportConfig.startDate);
        if (exportConfig.endDate) params.append('end', exportConfig.endDate);
        const url = `${apiBase}/summary/pdf?${params.toString()}`;

        // Fetch PDF with Authorization header and trigger download
        const res = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erreur serveur ${res.status}: ${text}`);
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('pdf')) {
          const text = await res.text();
          throw new Error(`Réponse inattendue du serveur (content-type=${contentType}): ${text}`);
        }
        const blob = await res.blob();
        if (!blob || blob.size === 0) {
          throw new Error('Fichier PDF vide reçu du serveur');
        }
        const filename = 'summary.pdf';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Fallback to client-side generation if no token present
        await generatePDF(filteredReports, exportConfig);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      setErrorMessage(String(error || 'Erreur inconnue'));
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportCount = () => {
    let count = reports.length;
    
    if (exportConfig.startDate || exportConfig.endDate || exportConfig.section !== 'all') {
      let filtered = reports;
      
      if (exportConfig.startDate) {
        filtered = filtered.filter(report => report.date >= exportConfig.startDate);
      }
      
      if (exportConfig.endDate) {
        filtered = filtered.filter(report => report.date <= exportConfig.endDate);
      }
      
      if (exportConfig.section !== 'all') {
        filtered = filtered.filter(report => report.sectionName === exportConfig.section);
      }
      
      count = filtered.length;
    }
    
    return count;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Export PDF</h1>
        <p className="text-sm lg:text-base text-gray-600">
          Générez des rapports PDF personnalisés des activités de l'église
        </p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            PDF généré et téléchargé avec succès !
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuration de l'Export
              </CardTitle>
              <CardDescription>
                Personnalisez le contenu et la période de votre rapport PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Période</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={exportConfig.startDate}
                      onChange={(e) => setExportConfig(prev => ({ 
                        ...prev, 
                        startDate: e.target.value 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={exportConfig.endDate}
                      onChange={(e) => setExportConfig(prev => ({ 
                        ...prev, 
                        endDate: e.target.value 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Filtres</h3>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={exportConfig.section}
                    onValueChange={(value) => setExportConfig(prev => ({ 
                      ...prev, 
                      section: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sections</SelectItem>
                      {sections.map(section => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Contenu</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeStats"
                      checked={exportConfig.includeStats}
                      onCheckedChange={(checked) => setExportConfig(prev => ({ 
                        ...prev, 
                        includeStats: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="includeStats">Inclure les statistiques générales</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDetails"
                      checked={exportConfig.includeDetails}
                      onCheckedChange={(checked) => setExportConfig(prev => ({ 
                        ...prev, 
                        includeDetails: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="includeDetails">Inclure les détails des rapports</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNotes"
                      checked={exportConfig.includeNotes}
                      onCheckedChange={(checked) => setExportConfig(prev => ({ 
                        ...prev, 
                        includeNotes: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="includeNotes">Inclure les notes et observations</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getReportCount()}
                  </div>
                  <div className="text-sm text-blue-700">
                    Rapport(s) à inclure
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Période:</span>
                  <span className="text-gray-600">
                    {exportConfig.startDate || exportConfig.endDate 
                      ? `${exportConfig.startDate || '...'} → ${exportConfig.endDate || '...'}`
                      : 'Toutes'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Section:</span>
                  <span className="text-gray-600">
                    {exportConfig.section === 'all' ? 'Toutes' : exportConfig.section}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Statistiques:</span>
                  <span className="text-gray-600">
                    {exportConfig.includeStats ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Détails:</span>
                  <span className="text-gray-600">
                    {exportConfig.includeDetails ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Notes:</span>
                  <span className="text-gray-600">
                    {exportConfig.includeNotes ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={isGenerating || getReportCount() === 0}
                className="w-full h-12 text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Générer le PDF
                  </>
                )}
              </Button>

              {getReportCount() === 0 && (
                <Alert>
                  <AlertDescription>
                    Aucun rapport ne correspond aux critères sélectionnés.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportPDF;
