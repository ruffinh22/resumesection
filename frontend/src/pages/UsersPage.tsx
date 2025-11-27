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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">👥 Gestion des Utilisateurs</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">Gérez les comptes utilisateurs et leurs rôles</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto text-xs sm:text-base"
            >
              <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline">Nouvel utilisateur</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm">
            <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-green-800">{successMsg}</span>
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6 sm:mb-8 overflow-hidden">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {editingId ? '✏️ Modifier l\'utilisateur' : '➕ Créer un nouvel utilisateur'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Nom d'utilisateur */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nom d'utilisateur
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="entrez le nom d'utilisateur"
                    className="w-full text-xs sm:text-sm"
                    minLength={3}
                    required
                  />
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Rôle
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="w-full text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">👨‍💼 Administrateur</SelectItem>
                      <SelectItem value="section">📊 Section</SelectItem>
                      <SelectItem value="viewer">👁️ Lecteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mot de passe */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Mot de passe {editingId && <span className="text-gray-500 font-normal">(optionnel)</span>}
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={editingId ? 'laissez vide pour ne pas changer' : 'entrez le mot de passe'}
                    className="w-full text-xs sm:text-sm"
                    minLength={editingId ? 0 : 6}
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-base py-2 sm:py-2.5"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? '⏳ Traitement...'
                    : editingId
                      ? '💾 Mettre à jour'
                      : '➕ Créer'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-base py-2 sm:py-2.5"
                >
                  ❌ Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Recherche */}
        {!showForm && users.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <Input
              type="text"
              placeholder="🔍 Rechercher par nom ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm"
            />
          </div>
        )}

        {/* Tableau des utilisateurs */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="text-center">
              <div className="text-gray-500 text-sm">⏳ Chargement des utilisateurs...</div>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Aucun utilisateur trouvé</p>
              {searchTerm && <p className="text-xs text-gray-400">Modifiez votre recherche</p>}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: Cartes */}
            <div className="sm:hidden space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📅 {user.created_at
                          ? new Date(user.created_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'section'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role === 'admin'
                        ? '👨‍💼 Admin'
                        : user.role === 'section'
                          ? '📊 Section'
                          : '👁️ Lecteur'}
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1 border-t border-gray-100">
                    <Button
                      onClick={() => handleEdit(user)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs py-1.5 h-7"
                      disabled={updateMutation.isPending}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDelete(user)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-800 hover:bg-red-50 text-xs py-1.5 h-7"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-xs lg:text-sm">
                  {/* En-tête */}
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold">👤 Utilisateur</th>
                      <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold">🎭 Rôle</th>
                      <th className="py-2 lg:py-3 px-2 lg:px-4 text-left font-semibold hidden lg:table-cell">📅 Créé le</th>
                      <th className="py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold hidden sm:table-cell">⚙️ Actions</th>
                    </tr>
                  </thead>

                  {/* Lignes */}
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } border-b border-gray-200 hover:bg-blue-50 transition-colors`}
                      >
                        <td className="py-2 lg:py-3 px-2 lg:px-4">
                          <span className="text-gray-900 font-medium truncate block text-xs lg:text-sm">{user.username}</span>
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4">
                          <span
                            className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'section'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role === 'admin'
                              ? '👨‍💼 Administrateur'
                              : user.role === 'section'
                                ? '📊 Section'
                                : '👁️ Lecteur'}
                          </span>
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4 text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              onClick={() => handleEdit(user)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-7 w-7 p-0"
                              disabled={updateMutation.isPending}
                              title="Modifier l'utilisateur"
                            >
                              <Edit2 className="w-3 lg:w-4 h-3 lg:h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(user)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 h-7 w-7 p-0"
                              disabled={deleteMutation.isPending}
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-3 lg:w-4 h-3 lg:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pied de page du tableau */}
              <div className="bg-gray-50 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 border-t border-gray-200 text-xs lg:text-sm text-gray-600">
                <p>
                  {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}