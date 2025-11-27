import React, { useState, useEffect } from 'react';
import { reportService, Report } from '../../api/reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Loader } from 'lucide-react';

/**
 * Composant pour afficher la liste des rapports d'une section
 */
export const SectionReportsList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await reportService.getMyReports();
        setReports(data);
      } catch (err: any) {
        setError(err.msg || 'Erreur lors du chargement des rapports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(0)} XOF`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des rapports...</p>
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

  if (reports.length === 0) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Aucun rapport disponible pour votre section
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-gray-700">Date</TableHead>
            <TableHead className="text-gray-700">Prédicateur</TableHead>
            <TableHead className="text-gray-700 text-right">Fidèles</TableHead>
            <TableHead className="text-gray-700 text-right">Offrande</TableHead>
            <TableHead className="text-gray-700">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">
                {formatDate(report.date)}
              </TableCell>
              <TableCell className="text-gray-700">{report.preacher}</TableCell>
              <TableCell className="text-right text-gray-700">
                {report.total_attendees}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-700">
                {formatCurrency(report.offering)}
              </TableCell>
              <TableCell className="text-gray-600 max-w-xs truncate">
                {report.notes || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectionReportsList;
