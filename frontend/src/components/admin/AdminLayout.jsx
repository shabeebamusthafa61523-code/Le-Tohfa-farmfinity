// components/admin/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar'; // or wherever your sidebar lives

const AdminLayout = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div className="flex min-h-screen bg-[#f4f7f4]">
      {/* The Sidebar needs to receive the props too */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 p-8 pt-24">
        {/* This renders the AdminStats, AdminBookings, etc. */}
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;