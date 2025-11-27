
import React, { useState } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ActivityReport } from './types';
import { saveReport } from './utils/storage';
import { CheckCircle } from 'lucide-react';

interface ReportFormProps {
  onReportSaved?: () => void; 
}

const ReportForm: React.FC<ReportFormProps> = ({ onReportSaved }) => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    preacher: '',
    totalFaithful: '',
    menCount: '',
    womenCount: '',
    childrenCount: '',
    youthCount: '',
    offering: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const report: ActivityReport = {
      id: Date.now(),
      date: formData.date,
      sectionName: user.sectionName || 'Administration',
      preacher: formData.preacher,
      totalFaithful: parseInt(formData.totalFaithful) || 0,
      menCount: parseInt(formData.menCount) || 0,
      womenCount: parseInt(formData.womenCount) || 0,
      childrenCount: parseInt(formData.childrenCount) || 0,
      youthCount: parseInt(formData.youthCount) || 0,
      offering: parseFloat(formData.offering) || 0,
      notes: formData.notes,
      submittedBy: user.username,
      submittedAt: new Date().toISOString()
    };
    saveReport(report);
    setSuccess(true);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      preacher: '',
      totalFaithful: '',
      menCount: '',
      womenCount: '',
      childrenCount: '',
      youthCount: '',
      offering: '',
      notes: ''
    });
    if (onReportSaved) onReportSaved();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg lg:text-2xl">Nouveau Compte-Rendu d'Activité</CardTitle>
        {/* Description */}
        <div className="text-gray-600 text-sm">Enregistrez les détails de l'activité religieuse</div>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Compte-rendu enregistré avec succès !
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations Générales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preacher">Prédicateur</Label>
                <Input
                  id="preacher"
                  name="preacher"
                  value={formData.preacher}
                  onChange={handleChange}
                  placeholder="Nom du prédicateur"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Comptage des Fidèles</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="totalFaithful" className="text-base font-medium">
                  Total Fidèles *
                </Label>
                <Input
                  id="totalFaithful"
                  name="totalFaithful"
                  type="number"
                  value={formData.totalFaithful}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  className="w-full text-lg font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="menCount" className="text-sm">Hommes</Label>
                <Input
                  id="menCount"
                  name="menCount"
                  type="number"
                  value={formData.menCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="womenCount" className="text-sm">Femmes</Label>
                <Input
                  id="womenCount"
                  name="womenCount"
                  type="number"
                  value={formData.womenCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childrenCount" className="text-sm">Enfants</Label>
                <Input
                  id="childrenCount"
                  name="childrenCount"
                  type="number"
                  value={formData.childrenCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youthCount" className="text-sm">Jeunes</Label>
                <Input
                  id="youthCount"
                  name="youthCount"
                  type="number"
                  value={formData.youthCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations Financières</h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="offering" className="text-base font-medium">
                  Quête (XOF)
                </Label>
                <Input
                  id="offering"
                  name="offering"
                  type="number"
                  step="0.01"
                  value={formData.offering}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  className="w-full text-lg font-semibold"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Notes Additionnelles</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Remarques particulières, événements spéciaux..."
                rows={4}
                className="w-full resize-none"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-lg font-semibold">
            Enregistrer le Compte-Rendu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
