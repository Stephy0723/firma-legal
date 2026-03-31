import React, { createContext, useContext, useState } from 'react';
import {
  FaHome,
  FaBriefcase,
  FaUsers,
  FaCalendarAlt,
  FaFolder,
  FaBalanceScale,
  FaChartBar,
  FaCog,
  FaUserCircle,
  FaInbox,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

export interface AdminMenuItem {
  id: string;
  label: string;
  path: string;
  icon: IconType;
  badge?: number;
  submenu?: AdminMenuItem[];
  section?: 'main' | 'activity' | 'settings';
}

interface AdminNavigationContextType {
  menuItems: AdminMenuItem[];
  activeMenuItem: string | null;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setActiveMenuItem: (id: string) => void;
}

const AdminNavigationContext = createContext<AdminNavigationContextType | undefined>(undefined);

export const AdminNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems: AdminMenuItem[] = [
    // MAIN SECTION
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin',
      icon: FaHome,
      section: 'main',
    },

    // ACTIVITY SECTION
    {
      id: 'activity',
      label: 'Actividad',
      path: '#',
      icon: FaChartBar,
      section: 'activity',
      submenu: [
        {
          id: 'inbox',
          label: 'Mensajes',
          path: '/admin/inbox',
          icon: FaInbox,
          badge: 3,
        },
        {
          id: 'appointments',
          label: 'Citas',
          path: '/admin/appointments',
          icon: FaCalendarAlt,
          badge: 2,
        },
        {
          id: 'cases',
          label: 'Expedientes',
          path: '/admin/cases',
          icon: FaBriefcase,
        },
      ],
    },

    // MAIN MENU SECTION
    {
      id: 'clients',
      label: 'Clientes',
      path: '/admin/clients',
      icon: FaUsers,
      section: 'main',
    },
    {
      id: 'documents',
      label: 'Documentos',
      path: '/admin/documents',
      icon: FaFolder,
      section: 'main',
    },
    {
      id: 'services',
      label: 'Servicios',
      path: '/admin/services',
      icon: FaBalanceScale,
      section: 'main',
    },
    {
      id: 'team',
      label: 'Equipo',
      path: '/admin/team',
      icon: FaUsers,
      section: 'main',
    },

    // SETTINGS SECTION
    {
      id: 'profile',
      label: 'Mi Perfil',
      path: '/admin/profile',
      icon: FaUserCircle,
      section: 'settings',
    },
    {
      id: 'settings',
      label: 'Configuración',
      path: '/admin/settings',
      icon: FaCog,
      section: 'settings',
    },
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AdminNavigationContext.Provider
      value={{
        menuItems,
        activeMenuItem,
        sidebarCollapsed,
        toggleSidebar,
        setActiveMenuItem,
      }}
    >
      {children}
    </AdminNavigationContext.Provider>
  );
};

export const useAdminNavigation = () => {
  const context = useContext(AdminNavigationContext);
  if (!context) {
    throw new Error('useAdminNavigation must be used within AdminNavigationProvider');
  }
  return context;
};
