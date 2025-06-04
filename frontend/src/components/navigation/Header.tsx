import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { Bell, Menu as MenuIcon, User, LogOut } from "lucide-react";
import { clsx } from "clsx";
import NotificationPanel from "../notifications/NotificationPanel";

type HeaderProps = {
  setSidebarOpen: (open: boolean) => void;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
};

const Header = ({
  setSidebarOpen,
  notificationOpen,
  setNotificationOpen,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="sticky top-0 z-10 bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-shrink-0 flex items-center lg:hidden">
              <h1 className="text-xl font-bold text-gray-900">FieldTask</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notification panel */}
            <NotificationPanel
              open={notificationOpen}
              setOpen={setNotificationOpen}
            />

            {/* Profile dropdown */}
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User className="h-5 w-5" />
                  </div>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 px-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/profile")}
                          className={clsx(
                            active ? "bg-gray-100" : "",
                            "w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center"
                          )}
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            active ? "bg-gray-100" : "",
                            "w-full text-left px-4 py-2 text-sm text-red-600 flex items-center"
                          )}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
