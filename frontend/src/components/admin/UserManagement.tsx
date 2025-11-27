import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Users, Plus, Edit, Trash2, UserCheck, Shield } from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'responsable';
  sectionName?: string;
  createdAt: string;
  lastLogin?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    role: 'responsable' as 'admin' | 'responsable',
    sectionName: ''
  });

  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        role: 'admin',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: '2',
        username: 'section1',
        role: 'responsable',
        sectionName: 'Section Centre',
        createdAt: '2024-01-16',
        lastLogin: '2024-01-19'
      },
      {
        id: '3',
        username: 'section2',
        role: 'responsable',
        sectionName: 'Section Nord',
        createdAt: '2024-01-17',
        lastLogin: '2024-01-18'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const handleCreateUser = () => {
    if (!newUser.username) return;

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      role: newUser.role,
      sectionName: newUser.role === 'responsable' ? newUser.sectionName : undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ username: '', role: 'responsable', sectionName: '' });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {user.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-red-600" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  )}
                  <h3 className="font-semibold">{user.username}</h3>
                </div>
                <Badge color={user.role === 'admin' ? 'destructive' : 'default'}>
                  {user.role === 'admin' ? 'Administrateur' : 'Responsable'}
                </Badge>
              </div>
              {user.sectionName && (
                <p className="text-sm text-gray-600 mb-2">Section: {user.sectionName}</p>
              )}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Créé le: {formatDate(user.createdAt)}</p>
                {user.lastLogin && (
                  <p>Dernière connexion: {formatDate(user.lastLogin)}</p>
                )}
              </div>
            </div>
          <div className="flex gap-2">
              <Button
                onClick={() => setEditingUser(user)}
                className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:bg-gray-100"
              >
                <Edit className="h-3 w-3" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>
              <Button
                onClick={() => handleDeleteUser(user.id)}
                className="flex items-center gap-1 border border-red-500 rounded px-2 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-sm lg:text-base text-gray-600">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur au système de gestion d'église
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Entrez le nom d'utilisateur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'admin' | 'responsable') => 
                    setNewUser(prev => ({ ...prev, role: value }))
                  }
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
              {newUser.role === 'responsable' && (
                <div className="space-y-2">
                  <Label htmlFor="sectionName">Nom de la Section</Label>
                  <Input
                    id="sectionName"
                    value={newUser.sectionName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, sectionName: e.target.value }))}
                    placeholder="Ex: Section Centre, Section Nord..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCreateDialogOpen(false)} className="border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100">
                Annuler
              </Button>
              <Button onClick={handleCreateUser} disabled={!newUser.username} className="border border-blue-500 rounded px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600">
                Créer l'Utilisateur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
              <p className="text-gray-600">Commencez par créer votre premier utilisateur</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden lg:block">
                <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                  <div>Utilisateur</div>
                  <div>Rôle</div>
                  <div>Section</div>
                  <div>Créé le</div>
                  <div>Actions</div>
                </div>
                {users.map(user => (
                  <div key={user.id} className="grid grid-cols-5 gap-4 p-3 border-b items-center">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-red-600" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <div>
                      <Badge color={user.role === 'admin' ? 'destructive' : 'default'}>
                        {user.role === 'admin' ? 'Admin' : 'Responsable'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.sectionName || '-'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingUser(user)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:bg-gray-100 flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        className="border border-red-500 rounded px-2 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="block lg:hidden">
                {users.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
