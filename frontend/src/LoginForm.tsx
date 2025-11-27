import React, { useState } from 'react';
import { AuthResponse } from './types';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data: AuthResponse = await res.json();
      if (res.ok && data.access_token) {
        onLogin(data.access_token);
        setMessage('Connexion réussie !');
      } else {
        setMessage('Identifiants invalides');
      }
    } catch {
      setMessage('Erreur serveur');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Connexion Responsable Religieux</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">Identifiant</label>
          <input
            id="username"
            className="w-full px-3 py-2 border rounded"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Votre identifiant"
            title="Identifiant"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Mot de passe</label>
          <input
            id="password"
            className="w-full px-3 py-2 border rounded"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Votre mot de passe"
            title="Mot de passe"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Se connecter</button>
      </form>
      {message && <p className={message.includes('réussie') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
    </div>
  );
};

export default LoginForm;
