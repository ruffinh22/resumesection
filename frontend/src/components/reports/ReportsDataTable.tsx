import React, { useState, useEffect } from 'react';
import { reportService, Report } from '../../api/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Loader, AlertCircle, Download, Trash2, Edit2, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface ReportsDataTableProps {
  isAdmin?: boolean;
  title?: string;
  description?: string;
}

type SortColumn = 'date' | 'preacher' | 'attendees' | 'offering' | null;
type SortDirection = 'asc' | 'desc';

/**
 * Tableau complet et bien formaté de tous les rapports
 */
export const ReportsDataTable: React.FC<ReportsDataTableProps> = ({
  isAdmin = false,
  title = 'Tous les Rapports',
  description = 'Liste complète des rapports enregistrés',
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Handler pour supprimer un rapport
  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }

    setDeletingId(reportId);
    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      setFilteredReports(filteredReports.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.msg || 'Erreur lors de la suppression');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // Handler pour télécharger un PDF
  const handleDownloadPDF = async (report: Report) => {
    try {
      const blob = await reportService.downloadReportPDF(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${report.date}-${report.preacher}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.msg || 'Erreur lors du téléchargement');
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data: Report[];
        if (isAdmin) {
          data = await reportService.getSummary();
        } else {
          data = await reportService.getMyReports();
        }
        setReports(data);
        setFilteredReports(data);
      } catch (err: any) {
        setError(err.msg || 'Erreur lors du chargement des rapports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [isAdmin]);

  // Filtrage par recherche
  useEffect(() => {
    let filtered = reports.filter((report) =>
      report.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.date.includes(searchTerm) ||
      (report.notes && report.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortColumn) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'preacher':
          aValue = a.preacher.toLowerCase();
          bValue = b.preacher.toLowerCase();
          break;
        case 'attendees':
          aValue = a.total_attendees;
          bValue = b.total_attendees;
          break;
        case 'offering':
          aValue = a.offering;
          bValue = b.offering;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReports(filtered);
  }, [searchTerm, reports, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Chargement des rapports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Aucun rapport disponible
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par prédicateur, date ou notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Statistiques - Améliorées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300 shadow-sm">
            <p className="text-gray-600 font-semibold text-xs uppercase tracking-wide">📊 Total Rapports</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">{reports.length}</p>
            <p className="text-xs text-gray-500 mt-1">enregistrés</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300 shadow-sm">
            <p className="text-gray-600 font-semibold text-xs uppercase tracking-wide">💰 Total Offrande</p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {formatCurrency(reports.reduce((sum, r) => sum + r.offering, 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">en XOF</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-300 shadow-sm">
            <p className="text-gray-600 font-semibold text-xs uppercase tracking-wide">👥 Total Fidèles</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {reports.reduce((sum, r) => sum + r.total_attendees, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">personnes</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-300 shadow-sm">
            <p className="text-gray-600 font-semibold text-xs uppercase tracking-wide">🔍 Résultats</p>
            <p className="text-3xl font-bold text-orange-700 mt-2">{filteredReports.length}</p>
            <p className="text-xs text-gray-500 mt-1">affichés</p>
          </div>
        </div>

        {/* Tableau - Bien tracé et organisé */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="w-full text-sm bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 border-b-2 border-blue-900">
                <th
                  className="px-3 py-3 text-left font-bold text-white cursor-pointer hover:bg-blue-600 transition group border-r border-blue-600"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    <span>📅 Date</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th className="px-3 py-3 text-left font-bold text-white border-r border-blue-600">
                  🏢 Section
                </th>
                <th
                  className="px-3 py-3 text-left font-bold text-white cursor-pointer hover:bg-blue-600 transition group border-r border-blue-600"
                  onClick={() => handleSort('preacher')}
                >
                  <div className="flex items-center gap-2">
                    <span>👨‍💬 Prédicateur</span>
                    {getSortIcon('preacher')}
                  </div>
                </th>
                <th
                  className="px-3 py-3 text-right font-bold text-white cursor-pointer hover:bg-blue-600 transition group border-r border-blue-600"
                  onClick={() => handleSort('attendees')}
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>👥 Total</span>
                    {getSortIcon('attendees')}
                  </div>
                </th>
                <th className="px-3 py-3 text-center font-bold text-white border-r border-blue-600">
                  👨 Hommes
                </th>
                <th className="px-3 py-3 text-center font-bold text-white border-r border-blue-600">
                  👩 Femmes
                </th>
                <th className="px-3 py-3 text-center font-bold text-white border-r border-blue-600">
                  👧 Enfants
                </th>
                <th className="px-3 py-3 text-center font-bold text-white border-r border-blue-600">
                  🧑 Jeunes
                </th>
                <th
                  className="px-3 py-3 text-right font-bold text-white cursor-pointer hover:bg-blue-600 transition group border-r border-blue-600"
                  onClick={() => handleSort('offering')}
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>💰 Offrande</span>
                    {getSortIcon('offering')}
                  </div>
                </th>
                <th className="px-3 py-3 text-left font-bold text-white border-r border-blue-600">
                  💱 Devise
                </th>
                <th className="px-3 py-3 text-left font-bold text-white border-r border-blue-600">
                  📝 Notes
                </th>
                <th className="px-3 py-3 text-center font-bold text-white">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    Aucun rapport ne correspond aux critères de recherche
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition group ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-3 font-medium text-gray-900 border-r border-gray-200">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-3 py-3 text-gray-700 border-r border-gray-200 font-medium text-center">
                      {report.section_id || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-700 border-r border-gray-200 font-medium">
                      {report.preacher}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-gray-900 border-r border-gray-200">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {report.total_attendees}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-blue-600 border-r border-gray-200">
                      {(report as any).men || '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-pink-600 border-r border-gray-200">
                      {(report as any).women || '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-green-600 border-r border-gray-200">
                      {(report as any).children || '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-orange-600 border-r border-gray-200">
                      {(report as any).youth || '—'}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-white bg-green-600 border-r border-gray-200">
                      <span className="block">{formatCurrency(report.offering)}</span>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-gray-700 border-r border-gray-200">
                      {report.currency || 'XOF'}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-xs truncate border-r border-gray-200">
                      {report.notes || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center space-x-1 flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-green-100"
                        title="Télécharger PDF"
                        onClick={() => handleDownloadPDF(report)}
                      >
                        <Download className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0 bg-red-100 text-red-600 hover:bg-red-200"
                        title="Supprimer"
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={deletingId === report.id}
                      >
                        {deletingId === report.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Résumé - Amélioré */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border-2 border-gray-300 text-sm text-gray-700">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="font-bold">Affichage:</span> <span className="text-blue-600 font-bold">{filteredReports.length}</span> rapport(s)
            </div>
            <div>
              <span className="font-bold">Disponibles:</span> <span className="text-green-600 font-bold">{reports.length}</span> total
            </div>
            {searchTerm && (
              <div className="text-orange-600">
                🔍 Filtre actif: "<span className="font-bold">{searchTerm}</span>"
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsDataTable;
