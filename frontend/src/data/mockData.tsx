import { Task } from "../types/task";
import { User } from "../types/user";
// import { Activity } from '../types/activity'; // Removed as mockActivities is being deleted

// Mock team members
export const mockTeam: User[] = [
  {
    id: "field-1",
    name: "John Smith",
    email: "john@fieldtask.com",
    role: "member",
    phone: "555-123-4567",
  },
  {
    id: "field-2",
    name: "Sarah Johnson",
    email: "sarah@fieldtask.com",
    role: "member",
    phone: "555-234-5678",
  },
  {
    id: "field-3",
    name: "Mike Davis",
    email: "mike@fieldtask.com",
    role: "member",
    phone: "555-345-6789",
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@fieldtask.com",
    role: "admin",
  },
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    taskId: "task-1",
    description:
      "Conduct a complete site inspection at Project Alpha. Check for safety compliance, progress on current phase, and document any issues.",
    status: "in_progress",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
    assignedTo: "field-1",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago - Reverted change
  },
  {
    taskId: "task-2",
    description:
      "Perform regular maintenance on the excavation equipment. Check fluid levels, inspect for damage, and test all safety features.",
    status: "New",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
    assignedTo: "field-2",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    taskId: "task-3",
    description:
      "Prepare presentation materials for the upcoming client meeting. Include project timeline, budget updates, and recent progress photos.",
    status: "completed",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    assignedTo: "field-3",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
  },
  {
    taskId: "task-4",
    description:
      "Coordinate with suppliers for the delivery of construction materials. Ensure delivery times align with project schedule and site access requirements.",
    status: "New",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days from now
    assignedTo: "field-1",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    taskId: "task-5",
    description:
      "Document completion of safety training for all new team members. Collect signed acknowledgments and update training records.",
    status: "New",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    assignedTo: "field-2",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    taskId: "task-6",
    description:
      "Complete and submit all required permit applications for the next phase of Project Charlie. Include all supporting documentation and pay applicable fees.",
    status: "completed",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    assignedTo: "field-3",
    createdBy: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
  },
];

// Mock activities - REMOVED as it's no longer used
// export const mockActivities: Activity[] = [
//   ...
// ];
