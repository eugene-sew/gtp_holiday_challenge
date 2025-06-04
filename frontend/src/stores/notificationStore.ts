import { create } from "zustand";
import { CheckSquare, AlertTriangle, Bell, Info } from "lucide-react";
import { Notification } from "../types/notification";
import React from "react";

/**
 * @interface NotificationState
 * Defines the shape of the notification state.
 * Includes an array of notifications and methods to manage them.
 */
interface NotificationState {
  notifications: Notification[];
  addNotification: (
    // Omits fields that are auto-generated on addition.
    notification: Omit<Notification, "id" | "read" | "timestamp" | "icon">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

/**
 * Maps a notification type string to its corresponding Lucide icon component.
 * @param {string} type - The type of the notification (e.g., "task_assigned", "error").
 * @returns {React.FC<React.SVGProps<SVGSVGElement>>} The Lucide icon component.
 */
const getIconComponent = (
  type: string
): React.FC<React.SVGProps<SVGSVGElement>> => {
  switch (type) {
    case "task_assigned":
      return CheckSquare;
    case "deadline":
      return AlertTriangle;
    case "status_update":
      return Info;
    case "error":
      return AlertTriangle;
    default:
      return Bell;
  }
};

/**
 * Zustand store for managing UI notifications.
 * Handles adding new notifications, marking them as read, and clearing them.
 * Automatically assigns an icon based on notification type.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  /**
   * Adds a new notification to the store.
   * Automatically generates ID, timestamp, read status, and icon.
   * @param {Omit<Notification, "id" | "read" | "timestamp" | "icon">} notification - Core notification data.
   */
  addNotification: (notification) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString(),
      icon: getIconComponent(notification.type),
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  /**
   * Marks a specific notification as read.
   * @param {string} id - The ID of the notification to mark as read.
   */
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
  },

  /**
   * Marks all currently stored notifications as read.
   */
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  },

  /**
   * Clears all notifications from the store.
   */
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
