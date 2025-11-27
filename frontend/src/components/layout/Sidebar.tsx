
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getLogoUrl } from '../../utils/assets';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', roles: ['admin', 'responsable', 'section'] },
  { id: 'reports', label: 'Comptes-Rendus', roles: ['admin', 'responsable', 'section'] },
  { id: 'stats', label: 'Statistiques', roles: ['admin'] },
  { id: 'users', label: 'Utilisateurs', roles: ['admin'] },
  { id: 'export', label: 'Export PDF', roles: ['admin'] }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <>
      {/* Sidebar desktop */}
      <div className="w-64 bg-white border-r h-full hidden lg:flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={getLogoUrl('full')} 
              alt="Logo Église" 
              className="w-12 h-12"
            />
            <div>
              <h2 className="font-bold text-blue-900">Gestion d'Église</h2>
              <p className="text-xs text-blue-600">{user?.role === 'admin' ? '✝️ Administrateur' : user?.sectionName || ''}</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-auto">
          {filteredMenuItems.map(item => (
            <button key={item.id} className={`w-full text-left p-2 rounded ${activeTab===item.id? 'bg-blue-600 text-white':''}`} onClick={() => handleTabChange(item.id)}>{item.label}</button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="text-sm font-medium">{user?.username}</div>
          <div className="text-xs text-gray-600 mb-2">{user?.role}</div>
          <button onClick={logout} className="w-full border rounded px-3 py-2 text-sm">Déconnexion</button>
        </div>
      </div>
      {/* Sidebar mobile */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-40">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 border-b p-3">
          <div className="flex items-center gap-2">
            <img 
              src={getLogoUrl('compact')} 
              alt="Logo Église" 
              className="w-10 h-10"
            />
            <div>
              <span className="font-bold text-blue-900 text-sm">Gestion d'Église</span>
              <span className="ml-2 text-xs text-blue-600">{user?.role === 'admin' ? '✝️ Admin' : user?.sectionName || ''}</span>
            </div>
          </div>
          <button onClick={() => setOpen(o => !o)} className="text-blue-600 font-bold text-lg">☰</button>
        </div>
        {open && (
          <div className="bg-white border-b shadow p-4 space-y-2">
            {filteredMenuItems.map(item => (
              <button key={item.id} className={`w-full text-left p-2 rounded ${activeTab===item.id? 'bg-blue-600 text-white':''}`} onClick={() => handleTabChange(item.id)}>{item.label}</button>
            ))}
            <div className="mt-4 border-t pt-2">
              <div className="text-sm font-medium">{user?.username}</div>
              <div className="text-xs text-gray-600 mb-2">{user?.role}</div>
              <button onClick={logout} className="w-full border rounded px-3 py-2 text-sm">Déconnexion</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;