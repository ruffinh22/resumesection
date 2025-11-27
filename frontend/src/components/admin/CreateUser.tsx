import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { UserPlus, CheckCircle } from 'lucide-react';

export const CreateUser: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'responsable',
    sectionName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setSuccess(true);
    
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'responsable',
      sectionName: ''
    });

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer un Nouvel Utilisateur
          </CardTitle>
          <CardDescription>
            Ajoutez un nouvel utilisateur au système de gestion d'église
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Utilisateur créé avec succès !
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="nom_utilisateur"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value as 'responsable' | 'admin' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="responsable">Responsable de Section</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === 'responsable' && (
              <div className="space-y-2">
                <Label htmlFor="sectionName">Nom de la Section *</Label>
                <Input
                  id="sectionName"
                  name="sectionName"
                  value={formData.sectionName}
                  onChange={handleChange}
                  placeholder="Ex: Section Centre, Section Nord, Section Sud..."
                  required={formData.role === 'responsable'}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {formData.password && formData.confirmPassword && 
             formData.password !== formData.confirmPassword && (
              <Alert variant="destructive">
                <AlertDescription>
                  Les mots de passe ne correspondent pas
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold"
              disabled={
                !formData.username || 
                !formData.password || 
                formData.password !== formData.confirmPassword ||
                (formData.role === 'responsable' && !formData.sectionName)
              }
            >
              Créer l'Utilisateur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUser;
