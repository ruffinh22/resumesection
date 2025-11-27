import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, createUser, updateUser, deleteUser, type User, type CreateUserPayload, type UpdateUserPayload } from '@/api/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react'

interface FormData {
  username: string
  password: string
  role: 'admin' | 'section' | 'viewer'
}

interface EditFormData extends FormData {
  id: number
}

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    role: 'section',
  })

  const queryClient = useQueryClient()

  // Récupérer les utilisateurs
  const { data: users = [] as User[], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1,
  })

  // Créer un utilisateur
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      setSuccessMsg('Utilisateur créé avec succès')
      setFormData({ username: '', password: '', role: 'section' })
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setTimeout(() => setSuccessMsg(null), 3000)
    },
    onError: (error: any) => {
      setError(error.msg || 'Erreur lors de la création')
      setTimeout(() => setError(null), 3000)
    },
  })

  // Mettre à jour un utilisateur
  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateUserPayload }) =>
      updateUser(userId, payload),
    onSuccess: () => {
      setSuccessMsg('Utilisateur mis à jour avec succès')
      setFormData({ username: '', password: '', role: 'section' })
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setTimeout(() => setSuccessMsg(null), 3000)
    },
    onError: (error: any) => {
      setError(error.msg || 'Erreur lors de la modification')
      setTimeout(() => setError(null), 3000)
    },
  })

  // Supprimer un utilisateur
  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      setSuccessMsg('Utilisateur supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setTimeout(() => setSuccessMsg(null), 3000)
    },
    onError: (error: any) => {
      setError(error.msg || 'Erreur lors de la suppression')
      setTimeout(() => setError(null), 3000)
    },
  })

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.username.trim()) {
      setError('Le nom d\'utilisateur est requis')
      return
    }

    if (editingId === null && !formData.password.trim()) {
      setError('Le mot de passe est requis pour une nouvelle création')
      return
    }

    if (editingId === null) {
      createMutation.mutate({
        username: formData.username,
        password: formData.password,
        role: formData.role,
      })
    } else {
      const updatePayload: UpdateUserPayload = {
        username: formData.username,
        role: formData.role,
      }

      if (formData.password.trim()) {
        updatePayload.password = formData.password
      }

      updateMutation.mutate({ userId: editingId, payload: updatePayload })
    }
  }

  // Gérer l'édition
  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
    })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  // Gérer l'annulation
  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ username: '', password: '', role: 'section' })
    setError(null)
  }

  // Gérer la suppression avec confirmation
  const handleDelete = (user: User) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`)) {
      deleteMutation.mutate(user.id)
    }
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">Erreur lors du chargement des utilisateurs</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="mt-1 text-gray-600">Gérez les comptes utilisateurs et leurs rôles</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel utilisateur
            </Button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800">{successMsg}</span>
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingId ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom d'utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="entrez le nom d'utilisateur"
                    className="w-full"
                    minLength={3}
                    required
                  />
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="viewer">Lecteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mot de passe */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe {editingId && <span className="text-gray-500">(optionnel pour la modification)</span>}
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={editingId ? 'laissez vide pour ne pas changer' : 'entrez le mot de passe'}
                    className="w-full"
                    minLength={editingId ? 0 : 6}
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Traitement...'
                    : editingId
                      ? 'Mettre à jour'
                      : 'Créer'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Recherche */}
        {!showForm && users.length > 0 && (
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Rechercher par nom ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Tableau des utilisateurs */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Chargement des utilisateurs...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Aucun utilisateur trouvé</p>
              {searchTerm && <p className="text-sm text-gray-400">Modifiez votre recherche</p>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* En-tête */}
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nom d'utilisateur</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Rôle</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Créé le</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>

                {/* Lignes */}
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } border-b border-gray-200 hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{user.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'section'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role === 'admin'
                            ? 'Administrateur'
                            : user.role === 'section'
                              ? 'Section'
                              : 'Lecteur'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(user)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            disabled={updateMutation.isPending}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(user)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pied de page du tableau */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}