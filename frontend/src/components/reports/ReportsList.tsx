import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityReport } from '../../types';
import { getReports } from '../../utils/storage';
import { Search, Calendar, Users, Euro } from 'lucide-react';

export const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ActivityReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ActivityReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    const loadReports = () => {
      let allReports = getReports();
      
      if (user?.role === 'responsable') {
        allReports = allReports.filter(report => report.sectionName === user.sectionName);
      }
      
      setReports(allReports.reverse());
      setFilteredReports(allReports);
    };

    loadReports();
  }, [user]);

  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSection !== 'all') {
      filtered = filtered.filter(report => report.sectionName === filterSection);
    }

    setFilteredReports(filtered);
  }, [searchTerm, filterSection, reports]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} XOF`;
  };

  const sections = [...new Set(reports.map(report => report.sectionName))];

  const ReportCard = ({ report }: { report: ActivityReport }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
          <div className="mb-3 lg:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{report.sectionName}</Badge>
              <span className="text-sm text-gray-500">#{report.id}</span>
            </div>
            <h3 className="font-semibold text-lg">{formatDate(report.date)}</h3>
            <p className="text-gray-600">Prédicateur: {report.preacher}</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{report.totalFaithful}</div>
              <div className="text-xs text-gray-600">Fidèles</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Euro className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">{formatCurrency(report.offering)}</div>
              <div className="text-xs text-gray-600">Quête</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="font-medium">{report.menCount}</div>
            <div className="text-xs text-gray-600">Hommes</div>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="font-medium">{report.womenCount}</div>
            <div className="text-xs text-gray-600">Femmes</div>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="font-medium">{report.childrenCount}</div>
            <div className="text-xs text-gray-600">Enfants</div>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="font-medium">{report.youthCount}</div>
            <div className="text-xs text-gray-600">Jeunes</div>
          </div>
        </div>

        {report.notes && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <h4 className="font-medium text-sm mb-1">Notes:</h4>
            <p className="text-sm text-gray-700">{report.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
          <span>Soumis par: {report.submittedBy}</span>
          <span>{new Date(report.submittedAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Liste des Rapports</h1>
        <p className="text-sm lg:text-base text-gray-600">
          {user?.role === 'admin' ? 'Tous les rapports d\'activité' : `Rapports de ${user?.sectionName}`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par prédicateur, section ou notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {user?.role === 'admin' && (
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filtrer par section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sections</SelectItem>
              {sections.map(section => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || filterSection !== 'all' 
                  ? 'Aucun rapport ne correspond à vos critères de recherche.'
                  : 'Aucun rapport n\'a encore été créé.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              {filteredReports.length} rapport(s) trouvé(s)
            </div>
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsList;
