
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
    <Card className="w-full">
      <CardHeader className="p-3 sm:p-4 lg:p-6 border-b border-slate-200">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
          ✍️ Nouveau Compte-Rendu d'Activité
        </CardTitle>
        <div className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">
          📋 Enregistrez les détails de l'activité religieuse
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {success && (
          <Alert className="mb-3 sm:mb-4 lg:mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 flex-shrink-0" />
            <AlertDescription className="text-xs sm:text-sm text-green-800">
              ✅ Compte-rendu enregistré avec succès !
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Section 1: Informations Générales */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5 sm:pb-2 lg:pb-3 flex items-center gap-1 sm:gap-1.5">
              📅 Informations Générales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="date" className="text-xs sm:text-sm font-medium text-slate-700">
                  📆 Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="preacher" className="text-xs sm:text-sm font-medium text-slate-700">
                  🎤 Prédicateur
                </Label>
                <Input
                  id="preacher"
                  name="preacher"
                  value={formData.preacher}
                  onChange={handleChange}
                  placeholder="Nom du prédicateur"
                  required
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Comptage des Fidèles */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5 sm:pb-2 lg:pb-3 flex items-center gap-1 sm:gap-1.5">
              👥 Comptage des Fidèles
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="totalFaithful" className="text-xs sm:text-sm font-bold text-blue-900">
                  👨‍👩‍👧‍👦 Total Fidèles *
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
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base font-bold border-2 border-blue-300 rounded-lg bg-white text-blue-900"
                />
              </div>
            </div>

            {/* Grille des catégories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="menCount" className="text-xs font-medium text-slate-700 truncate">
                  👨 Hommes
                </Label>
                <Input
                  id="menCount"
                  name="menCount"
                  type="number"
                  value={formData.menCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="womenCount" className="text-xs font-medium text-slate-700 truncate">
                  👩 Femmes
                </Label>
                <Input
                  id="womenCount"
                  name="womenCount"
                  type="number"
                  value={formData.womenCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="childrenCount" className="text-xs font-medium text-slate-700 truncate">
                  👧 Enfants
                </Label>
                <Input
                  id="childrenCount"
                  name="childrenCount"
                  type="number"
                  value={formData.childrenCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="youthCount" className="text-xs font-medium text-slate-700 truncate">
                  🧑 Jeunes
                </Label>
                <Input
                  id="youthCount"
                  name="youthCount"
                  type="number"
                  value={formData.youthCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Finances */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5 sm:pb-2 lg:pb-3 flex items-center gap-1 sm:gap-1.5">
              💰 Informations Financières
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="offering" className="text-xs sm:text-sm font-bold text-yellow-900">
                  💵 Quête (XOF)
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
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base font-bold border-2 border-yellow-300 rounded-lg bg-white text-yellow-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5 sm:pb-2 lg:pb-3 flex items-center gap-1 sm:gap-1.5">
              📝 Notes Additionnelles
            </h3>
            <div className="space-y-1 sm:space-y-1.5">
              <Label htmlFor="notes" className="text-xs sm:text-sm font-medium text-slate-700">
                📌 Remarques (optionnel)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Événements spéciaux, observations importantes..."
                rows={3}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg resize-none"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            className="w-full h-9 sm:h-10 lg:h-12 text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg mt-2 sm:mt-3 lg:mt-4"
          >
            ✅ Enregistrer le Compte-Rendu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
