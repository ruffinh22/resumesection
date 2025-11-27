
import React, { useState } from 'react';

interface AddSectionFormProps {
  token: string;
}

const AddSectionForm: React.FC<AddSectionFormProps> = ({ token }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, role: 'section' })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Section créée !');
        setUsername('');
        setPassword('');
      } else {
        setMessage(data.msg || 'Erreur lors de la création');
      }
    } catch {
      setMessage('Erreur serveur');
    }
    setLoading(false);
  };

  return (
    <div className="mb-8 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-2">Créer un accès section</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="w-full px-3 py-2 border rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Création...' : 'Créer la section'}
        </button>
      </form>
      {message && <p className={message.includes('créée') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
    </div>
  );
};

export default AddSectionForm;
