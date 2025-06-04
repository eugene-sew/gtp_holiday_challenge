export interface Task {
  taskId: string;
  description: string;
  status: "New" | "in_progress" | "completed";
  deadline: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
