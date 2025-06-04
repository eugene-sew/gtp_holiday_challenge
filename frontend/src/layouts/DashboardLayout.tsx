import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import MobileSidebar from '../components/navigation/MobileSidebar';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { notifications } = useNotificationStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Close sidebar when route changes
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Check if we're in team route and user is not admin
    if (pathname.includes('/team') && user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [pathname, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
        />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Notification indicator - only show if there are unread notifications */}
      {notifications.filter(n => !n.read).length > 0 && (
        <button
          onClick={() => setNotificationOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg lg:hidden"
        >
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.filter(n => !n.read).length}
          </span>
        </button>
      )}
    </div>
  );
};

export default DashboardLayout;