import React from "react"; // Ensure React is imported for React.FC

export interface Notification {
  id: string;
  type: "task_assigned" | "deadline" | "status_update" | "error";
  title: string;
  message: string;
  read: boolean;
  timestamp: string; // ISO date string
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}
