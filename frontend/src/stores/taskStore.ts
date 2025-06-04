import { create } from "zustand";
import { Task } from "../types/task";
import { useAuthStore } from "./authStore";

// Base URL for the tasks API, sourced from environment variables.
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

/**
 * @interface TaskState
 * Defines the shape of the task management state.
 * Includes the list of tasks and methods for CRUD operations and fetching.
 */
interface TaskState {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  addTask: (
    // Uses Pick to select only necessary fields for task creation.
    taskData: Pick<Task, "description" | "deadline" | "assignedTo">
  ) => Promise<void>;
  updateTask: (taskId: string, status: Task["status"]) => Promise<void>; // Allows updating only the status.
  deleteTask: (taskId: string) => Promise<void>;
}

/**
 * Zustand store for managing tasks.
 * Handles fetching, creating, updating, and deleting tasks via API calls.
 * Ensures authenticated user context (via useAuthStore) for API interactions.
 */
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [], // Initial state: an empty array of tasks.

  /**
   * Fetches all tasks from the API.
   * Requires an authenticated user with a valid ID token.
   * Updates the tasks in the store on success, or sets to empty on failure/auth error.
   */
  fetchTasks: async () => {
    const { user } = useAuthStore.getState(); // Get current user from authStore.
    if (!user || !user.idToken) {
      console.error("Fetch tasks: User not authenticated or idToken missing.");
      set({ tasks: [] }); // Clear tasks if user is not authenticated.
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`, // Pass JWT for authorization.
        },
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Failed to fetch tasks: ${errorData.message || response.statusText}`
        );
      }
      const tasks: Task[] = await response.json();
      set({ tasks }); // Update store with fetched tasks.
    } catch (error) {
      console.error("Fetch tasks failed:", error);
      set({ tasks: [] }); // Clear tasks on error.
    }
  },

  /**
   * Retrieves a single task by its ID from the local store.
   * @param {string} taskId - The ID of the task to retrieve.
   * @returns {Task | undefined} The task object if found, otherwise undefined.
   */
  getTaskById: (taskId: string) => {
    return get().tasks.find((task) => task.taskId === taskId);
  },

  /**
   * Adds a new task via an API call.
   * Requires admin role for authorization (as per current business logic).
   * @param {Pick<Task, "description" | "deadline" | "assignedTo">} taskData - Essential data for new task.
   * @returns {Promise<void>} Resolves on success, throws error on failure.
   */
  addTask: async (
    taskData: Pick<Task, "description" | "deadline" | "assignedTo">
  ) => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Add task: User not authenticated or idToken missing.");
      throw new Error("User not authenticated");
    }
    // Example of role-based access control on the client-side, though backend should always enforce this.
    if (user.role !== "admin") {
      console.warn("Add task: Only admins can add tasks.");
      throw new Error("Only admins can add tasks.");
    }

    const payload = { ...taskData }; // Prepare payload for API.

    try {
      const response = await fetch(`${API_BASE_URL}tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Failed to add task: ${errorData.message || response.statusText}`
        );
      }
      const newTask: Task = await response.json();
      // Optimistically update the local store with the new task.
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      console.error("Add task failed:", error);
      throw error; // Propagate error for UI handling.
    }
  },

  /**
   * Updates the status of an existing task via an API call.
   * @param {string} taskId - The ID of the task to update.
   * @param {Task["status"]} status - The new status for the task.
   * @returns {Promise<void>} Resolves on success, throws error on failure.
   */
  updateTask: async (taskId: string, status: Task["status"]) => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Update task: User not authenticated or idToken missing.");
      throw new Error("User not authenticated");
    }

    const payload = { taskId, status };

    try {
      // Note: API endpoint for task update might vary (e.g., PUT /tasks/{taskId})
      // Current implementation uses PUT /tasks with taskId in the body.
      const response = await fetch(`${API_BASE_URL}tasks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Failed to update task: ${errorData.message || response.statusText}`
        );
      }
      // Optimistically update the local store.
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.taskId === taskId
            ? { ...t, status, updatedAt: new Date().toISOString() } // Update status and timestamp.
            : t
        ),
      }));
    } catch (error) {
      console.error("Update task failed:", error);
      throw error;
    }
  },

  /**
   * Deletes a task via an API call.
   * Requires admin role (as per current client-side check).
   * @param {string} taskId - The ID of the task to delete.
   * @returns {Promise<void>} Resolves on success, throws error on failure.
   */
  deleteTask: async (taskId: string) => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Delete task: User not authenticated or idToken missing.");
      throw new Error("User not authenticated");
    }
    if (user.role !== "admin") {
      console.warn("Delete task: Only admins can delete tasks.");
      throw new Error("Only admins can delete tasks.");
    }

    // Placeholder for actual API call.
    // Example: await fetch(`${API_BASE_URL}tasks/${taskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.idToken}` } });
    console.warn(`Simulating delete for task ${taskId}. API call needed.`);

    // Optimistically remove from local store.
    set((state) => ({
      tasks: state.tasks.filter((task) => task.taskId !== taskId),
    }));
    // If API call fails, an error should be thrown and caught by the caller
    // to potentially revert this optimistic update or notify the user.
  },
}));
