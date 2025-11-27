import React from 'react';
import { Logo } from '../components/Logo';

export const BrandingShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Titre */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🏛️ Branding ResumeSection</h1>
          <p className="text-lg text-gray-600">Système d'identité visuelle - Église Évangélique</p>
        </div>

        {/* Logo Principal */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Logo Principal</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <img 
                src="/church-logo.svg" 
                alt="Logo Principal" 
                className="w-full max-w-xs mx-auto"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold">Caractéristiques</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Dimensions : 240×240 pixels</li>
                <li>✅ Format : SVG (scalable)</li>
                <li>✅ Couleurs : Bleu, Or, Rouge</li>
                <li>✅ Inclut : Texte et symboles</li>
                <li>✅ Fichier : <code className="bg-gray-100 px-2 py-1 rounded">/church-logo.svg</code></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Logo Compact */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Logo Compact (Favicon)</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <img 
                src="/church-logo-compact.svg" 
                alt="Logo Compact" 
                className="w-full max-w-xs mx-auto"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold">Utilisations</h3>
              <ul className="space-y-2 text-gray-700">
                <li>🌐 Favicon du navigateur (16×16 à 180×180)</li>
                <li>📱 Icône Apple pour iOS</li>
                <li>🔖 Signet de navigateur</li>
                <li>🎯 Petites icônes/badges</li>
                <li>📁 Fichier : <code className="bg-gray-100 px-2 py-1 rounded">/church-logo-compact.svg</code></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Composant Logo React */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Composant React réutilisable</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Variante Full */}
            <div className="border-2 border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Variante: Full (Complet)</h3>
              <div className="bg-gray-50 p-4 rounded flex justify-center items-center">
                <Logo variant="full" size="lg" />
              </div>
              <code className="block bg-gray-900 text-white p-3 rounded text-sm">
                &lt;Logo variant="full" size="lg" /&gt;
              </code>
            </div>

            {/* Variante Compact */}
            <div className="border-2 border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Variante: Compact</h3>
              <div className="bg-gray-50 p-4 rounded flex justify-center items-center">
                <Logo variant="compact" size="lg" />
              </div>
              <code className="block bg-gray-900 text-white p-3 rounded text-sm">
                &lt;Logo variant="compact" size="lg" /&gt;
              </code>
            </div>

            {/* Variante Icon */}
            <div className="border-2 border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Variante: Icon (Icône)</h3>
              <div className="bg-gray-50 p-4 rounded flex justify-center items-center">
                <Logo variant="icon" size="lg" />
              </div>
              <code className="block bg-gray-900 text-white p-3 rounded text-sm">
                &lt;Logo variant="icon" size="lg" /&gt;
              </code>
            </div>

            {/* Variante Sans texte */}
            <div className="border-2 border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Complet sans texte</h3>
              <div className="bg-gray-50 p-4 rounded flex justify-center items-center">
                <Logo variant="full" size="lg" showText={false} />
              </div>
              <code className="block bg-gray-900 text-white p-3 rounded text-sm">
                &lt;Logo showText={'{false}'} /&gt;
              </code>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">Propriétés disponibles</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><code className="bg-white px-2 py-0.5 rounded">variant</code> : "full" | "compact" | "icon"</li>
              <li><code className="bg-white px-2 py-0.5 rounded">size</code> : "sm" | "md" | "lg" | "xl"</li>
              <li><code className="bg-white px-2 py-0.5 rounded">showText</code> : boolean (défaut: true)</li>
              <li><code className="bg-white px-2 py-0.5 rounded">className</code> : string CSS personnalisé</li>
            </ul>
          </div>
        </section>

        {/* Palette de couleurs */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Palette de couleurs</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="w-full h-24 bg-blue-500 rounded-lg shadow"></div>
              <h3 className="font-semibold">Bleu principal</h3>
              <p className="text-sm text-gray-600">#3B82F6</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-24 bg-blue-900 rounded-lg shadow"></div>
              <h3 className="font-semibold">Bleu foncé</h3>
              <p className="text-sm text-gray-600">#1E40AF</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-24 bg-amber-400 rounded-lg shadow"></div>
              <h3 className="font-semibold">Or/Jaune</h3>
              <p className="text-sm text-gray-600">#FBB F24</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-24 bg-red-600 rounded-lg shadow"></div>
              <h3 className="font-semibold">Rouge</h3>
              <p className="text-sm text-gray-600">#DC2626</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-24 bg-white rounded-lg shadow border-2 border-gray-200"></div>
              <h3 className="font-semibold">Blanc</h3>
              <p className="text-sm text-gray-600">#FFFFFF</p>
            </div>
          </div>
        </section>

        {/* Intégrations */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Lieux d'intégration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Page de connexion</h3>
              <p className="text-sm text-gray-700">Logo 80×80 centré en haut du formulaire</p>
            </div>
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Barre latérale</h3>
              <p className="text-sm text-gray-700">Desktop (48×48) et Mobile (40×40)</p>
            </div>
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ En-tête principal</h3>
              <p className="text-sm text-gray-700">Composant Header avec gradient bleu</p>
            </div>
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Favicon navigateur</h3>
              <p className="text-sm text-gray-700">Logo compact dans tous les onglets</p>
            </div>
          </div>
        </section>

        {/* Documentation */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">📚 Documentation complète</h2>
          <p className="text-gray-700 mb-4">
            Pour plus de détails sur le branding, les recommandations d'utilisation, et les variantes de style :
          </p>
          <a 
            href="BRANDING.md" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Voir BRANDING.md →
          </a>
        </section>
      </div>
    </div>
  );
};

export default BrandingShowcase;
