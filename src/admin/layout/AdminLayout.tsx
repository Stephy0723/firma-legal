import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminFloatingTools from '../components/AdminFloatingTools';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarCollapsed || !sidebarRef.current) {
        return;
      }

      const target = event.target as Node;
      if (!sidebarRef.current.contains(target)) {
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarCollapsed]);

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'admin-shell--collapsed' : ''}`}>
      <AdminSidebar
        ref={sidebarRef}
        collapsed={sidebarCollapsed}
        onRequestExpand={() => setSidebarCollapsed(false)}
      />
      <div className="admin-shell__main">
        <AdminNavbar onToggleSidebar={() => setSidebarCollapsed((v) => !v)} />
        <main className="admin-shell__content">
          <Outlet />
        </main>
        <AdminFloatingTools />
      </div>
    </div>
  );
};

export default AdminLayout;
