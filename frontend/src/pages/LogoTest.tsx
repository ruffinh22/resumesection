import React from 'react';

export const LogoTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">🏛️ Test d'affichage du Logo</h1>
        <p className="text-gray-600 mb-6">Vérification que les logos s'affichent correctement</p>
      </div>

      {/* Logo principal */}
      <div className="border-2 border-blue-200 p-6 rounded-lg bg-blue-50">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Logo Principal (Full)</h2>
        <div className="flex gap-8">
          <div>
            <img 
              src="/church-logo.svg" 
              alt="Logo Small" 
              style={{ width: '48px', height: '48px' }}
              onError={(e) => {
                console.error('Logo failed:', e);
                (e.target as HTMLImageElement).style.border = '2px solid red';
                (e.target as HTMLImageElement).style.background = '#ffcccc';
              }}
            />
            <p className="text-sm mt-2">48×48</p>
          </div>
          <div>
            <img 
              src="/church-logo.svg" 
              alt="Logo Medium" 
              style={{ width: '80px', height: '80px' }}
              onError={(e) => console.error('Logo failed:', e)}
            />
            <p className="text-sm mt-2">80×80</p>
          </div>
          <div>
            <img 
              src="/church-logo.svg" 
              alt="Logo Large" 
              style={{ width: '120px', height: '120px' }}
              onError={(e) => console.error('Logo failed:', e)}
            />
            <p className="text-sm mt-2">120×120</p>
          </div>
        </div>
      </div>

      {/* Logo compact */}
      <div className="border-2 border-green-200 p-6 rounded-lg bg-green-50">
        <h2 className="text-xl font-bold mb-4 text-green-900">Logo Compact</h2>
        <div className="flex gap-8">
          <div>
            <img 
              src="/church-logo-compact.svg" 
              alt="Logo Compact Small" 
              style={{ width: '32px', height: '32px' }}
              onError={(e) => console.error('Compact logo failed:', e)}
            />
            <p className="text-sm mt-2">32×32</p>
          </div>
          <div>
            <img 
              src="/church-logo-compact.svg" 
              alt="Logo Compact Medium" 
              style={{ width: '64px', height: '64px' }}
              onError={(e) => console.error('Compact logo failed:', e)}
            />
            <p className="text-sm mt-2">64×64</p>
          </div>
          <div>
            <img 
              src="/church-logo-compact.svg" 
              alt="Logo Compact Large" 
              style={{ width: '100px', height: '100px' }}
              onError={(e) => console.error('Compact logo failed:', e)}
            />
            <p className="text-sm mt-2">100×100</p>
          </div>
        </div>
      </div>

      {/* Informations de débogage */}
      <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-yellow-900">ℹ️ Informations de débogage</h2>
        <div className="space-y-2 text-sm font-mono">
          <p><strong>Chemin public :</strong> /church-logo.svg</p>
          <p><strong>Chemin compact :</strong> /church-logo-compact.svg</p>
          <p><strong>Dossier :</strong> frontend/public/</p>
          <p><strong>Vérifiez la console F12</strong> pour les erreurs de chargement</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-900">✅ Si vous voyez les logos :</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Les fichiers SVG sont correctement servis par Vite</li>
          <li>Les chemins `/church-logo.svg` et `/church-logo-compact.svg` fonctionnent</li>
          <li>Vous pouvez les utiliser partout dans l'application</li>
        </ul>
      </div>

      {/* Résumé du chemin */}
      <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">📁 Structure des fichiers</h2>
        <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto">
{`frontend/
├── public/
│   ├── church-logo.svg          ← Logo principal
│   ├── church-logo-compact.svg  ← Logo compact
│   └── test-logo.html           ← Test HTML
└── src/
    └── pages/
        └── LogoTest.tsx         ← Cette page`}
        </pre>
      </div>
    </div>
  );
};

export default LogoTest;
