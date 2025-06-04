import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  ClipboardCheck, 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  UserCircle,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Team', href: '/team', icon: Users, adminOnly: true },
  { name: 'Profile', href: '/profile', icon: UserCircle },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <ClipboardCheck className="h-8 w-8 text-blue-600 mr-3" />
          <span className="text-xl font-bold text-gray-900">FieldTask</span>
        </div>
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Logged in as</p>
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {navigation.filter(item => !item.adminOnly || isAdmin).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-150'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-4 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut className="mr-4 flex-shrink-0 h-6 w-6" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;