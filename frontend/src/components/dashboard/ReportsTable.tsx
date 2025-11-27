
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityReport } from '../../types';

interface ReportsTableProps {
  reports: ActivityReport[];
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} XOF`;
  };

  const MobileReportCard = ({ report }: { report: ActivityReport }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge variant="outline" className="mb-1">{report.sectionName}</Badge>
            <p className="text-sm text-gray-600">{formatDate(report.date)}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{formatCurrency(report.offering)}</p>
            <p className="text-sm text-gray-600">{report.totalFaithful} fidèles</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">Prédicateur: </span>
            <span className="text-sm">{report.preacher}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>H: {report.menCount}</div>
            <div>F: {report.womenCount}</div>
            <div>E: {report.childrenCount}</div>
            <div>J: {report.youthCount}</div>
          </div>
          <div className="pt-2 border-t">
            <span className="text-xs text-gray-500">Par: {report.submittedBy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg lg:text-xl">Rapports Récents</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Aucun rapport disponible</p>
          </div>
        ) : (
          <>
            <div className="block lg:hidden">
              {reports.map((report) => (
                <MobileReportCard key={report.id} report={report} />
              ))}
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Prédicateur</TableHead>
                    <TableHead>Fidèles</TableHead>
                    <TableHead>Quête</TableHead>
                    <TableHead>Soumis par</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{formatDate(report.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.sectionName}</Badge>
                      </TableCell>
                      <TableCell>{report.preacher}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{report.totalFaithful} total</div>
                          <div className="text-gray-500">
                            H:{report.menCount} F:{report.womenCount} E:{report.childrenCount} J:{report.youthCount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(report.offering)}
                      </TableCell>
                      <TableCell>{report.submittedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
