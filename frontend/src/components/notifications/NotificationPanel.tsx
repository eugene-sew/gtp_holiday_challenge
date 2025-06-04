import { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XCircle, Clock, Bell } from "lucide-react";
import { useNotificationStore } from "../../stores/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";

type NotificationPanelProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const NotificationPanel = ({ open, setOpen }: NotificationPanelProps) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  // Mark all as read when panel is opened
  useEffect(() => {
    if (open) {
      markAllAsRead();
    }
  }, [open, markAllAsRead]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden z-40"
        onClose={setOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-blue-600" />
                        Notifications
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XCircle className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No notifications
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          You're all caught up! No new notifications.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <li
                            key={notification.id}
                            className={clsx(
                              "p-4 hover:bg-gray-50 transition-colors duration-150",
                              !notification.read && "bg-blue-50"
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                <div
                                  className={clsx(
                                    "h-10 w-10 rounded-full flex items-center justify-center",
                                    notification.type === "task_assigned" &&
                                      "bg-blue-100 text-blue-600",
                                    notification.type === "deadline" &&
                                      "bg-amber-100 text-amber-600",
                                    notification.type === "status_update" &&
                                      "bg-green-100 text-green-600"
                                  )}
                                >
                                  {<notification.icon />}
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {notification.message}
                                </p>
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDistanceToNow(
                                    new Date(notification.timestamp),
                                    { addSuffix: true }
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NotificationPanel;
