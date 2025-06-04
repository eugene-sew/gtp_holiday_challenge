import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import {
  XCircle,
  ClipboardCheck,
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Team", href: "/team", icon: Users, adminOnly: true },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

type MobileSidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileSidebar = ({ open, setOpen }: MobileSidebarProps) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 flex z-40">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XCircle
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <ClipboardCheck className="h-8 w-8 text-blue-600 mr-3" />
                  <span className="text-xl font-bold text-gray-900">
                    FieldTask
                  </span>
                </div>
                <div className="px-4 mt-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700">
                      Logged in as
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {user?.id}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation
                    .filter((item) => !item.adminOnly || isAdmin)
                    .map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={clsx(
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                          )}
                        >
                          <item.icon
                            className={clsx(
                              isActive
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-4 flex-shrink-0 h-6 w-6"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                </nav>
              </div>
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-4 flex-shrink-0 h-6 w-6" />
                  Logout
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MobileSidebar;
