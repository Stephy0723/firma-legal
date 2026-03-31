import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../AdminSidebar/AdminSidebar';
import { AdminNavbar } from '../AdminNavbar/AdminNavbar';
import { AdminNavigationProvider } from '../../../context/AdminNavigationContext';
import LegalAssistantBot from '../../LegalAssistantBot/LegalAssistantBot';
import './AdminLayoutV2.scss';

export const AdminLayoutV2: React.FC = () => {
  return (
    <AdminNavigationProvider>
      <div className="admin-layout-v2">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="admin-layout-v2__main">
          {/* Navbar */}
          <AdminNavbar />

          {/* Content */}
          <main className="admin-layout-v2__content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Legal Assistant Bot */}
      <LegalAssistantBot />
    </AdminNavigationProvider>
  );
};

export default AdminLayoutV2;
