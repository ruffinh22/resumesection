import React, { useState } from 'react';
import AddSectionForm from './AddSectionForm';
import { SummaryReport } from './types';

interface AdminSummaryProps {
  token: string;
}

const AdminSummary: React.FC<AdminSummaryProps> = ({ token }) => {
  const [summary, setSummary] = useState<SummaryReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data);
      } else {
        // Affiche tout le message d’erreur backend pour debug
        setError(JSON.stringify(data));
      }
    } catch (e) {
      setError('Erreur serveur: ' + e);
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    window.open('http://localhost:5000/summary/pdf', '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <AddSectionForm token={token} />
      <h2 className="text-xl font-bold mb-4 text-center">Synthèse des activités</h2>
      <button onClick={fetchSummary} className="mb-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Charger la synthèse</button>
      <button onClick={downloadPDF} className="mb-4 ml-2 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">Télécharger PDF</button>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Section</th>
            <th className="border px-2">Date</th>
            <th className="border px-2">Prédicateur</th>
            <th className="border px-2">Total</th>
            <th className="border px-2">Hommes</th>
            <th className="border px-2">Femmes</th>
            <th className="border px-2">Enfants</th>
            <th className="border px-2">Jeunes</th>
            <th className="border px-2">Quête</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((r, i) => (
            <tr key={i}>
              <td className="border px-2">{r.section_id}</td>
              <td className="border px-2">{r.date}</td>
              <td className="border px-2">{r.preacher}</td>
              <td className="border px-2">{r.total_attendees}</td>
              <td className="border px-2">{r.men}</td>
              <td className="border px-2">{r.women}</td>
              <td className="border px-2">{r.children}</td>
              <td className="border px-2">{r.youth}</td>
              <td className="border px-2">{r.offering}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSummary;
