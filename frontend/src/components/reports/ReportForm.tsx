import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { reportService } from '../../api/reports';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ReportFormProps {
  onSuccess?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    preacher: '',
    total_attendees: '',
    men: '',
    women: '',
    children: '',
    youth: '',
    offering: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.preacher.trim()) {
        throw new Error('Le nom du prédicateur est requis');
      }

      if (!formData.total_attendees.trim()) {
        throw new Error('Le nombre de fidèles est requis');
      }

      const totalInt = parseInt(formData.total_attendees);
      if (isNaN(totalInt) || totalInt < 0) {
        throw new Error('Le nombre de fidèles doit être un nombre positif');
      }

      // Préparer les données
      const data = {
        date: formData.date,
        preacher: formData.preacher.trim(),
        total_attendees: totalInt,
        men: formData.men ? parseInt(formData.men) : 0,
        women: formData.women ? parseInt(formData.women) : 0,
        children: formData.children ? parseInt(formData.children) : 0,
        youth: formData.youth ? parseInt(formData.youth) : 0,
        offering: formData.offering ? parseFloat(formData.offering) : 0,
        notes: formData.notes.trim() || undefined,
      };

      // Envoyer à l'API
      await reportService.createReport(data);

      setSuccess(true);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        preacher: '',
        total_attendees: '',
        men: '',
        women: '',
        children: '',
        youth: '',
        offering: '',
        notes: ''
      });

      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || err.msg || 'Erreur lors de la création du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg lg:text-2xl">Nouveau Compte-Rendu d'Activité</CardTitle>
        <CardDescription>
          Enregistrez les détails de l'activité religieuse
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Rapport créé avec succès !
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Comptage des Fidèles</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="total_attendees" className="text-base font-medium">
                  Total Fidèles *
                </Label>
                <Input
                  id="total_attendees"
                  name="total_attendees"
                  type="number"
                  value={formData.total_attendees}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  className="w-full text-lg font-semibold"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="men" className="text-sm">Hommes</Label>
                <Input
                  id="men"
                  name="men"
                  type="number"
                  value={formData.men}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="women" className="text-sm">Femmes</Label>
                <Input
                  id="women"
                  name="women"
                  type="number"
                  value={formData.women}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children" className="text-sm">Enfants</Label>
                <Input
                  id="children"
                  name="children"
                  type="number"
                  value={formData.children}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youth" className="text-sm">Jeunes</Label>
                <Input
                  id="youth"
                  name="youth"
                  type="number"
                  value={formData.youth}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full"
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? 'Enregistrement en cours...' : 'Enregistrer le Rapport'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
