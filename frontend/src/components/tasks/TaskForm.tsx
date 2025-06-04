import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../../stores/taskStore";
import { useTeamStore } from "../../stores/teamStore";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { Task } from "../../types/task";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Calendar, Clock, FileText, Users } from "lucide-react";

/**
 * @interface TaskFormProps
 * Defines the props for the TaskForm component.
 */
type TaskFormProps = {
  task?: Task; // Optional: The existing task object if editing.
  isEditing?: boolean; // Optional: Flag to indicate if the form is for editing an existing task.
};

/**
 * TaskForm component: Provides a form for creating or editing tasks.
 * Handles form state, validation, and submission.
 * On submission, it calls appropriate actions from the taskStore (addTask or updateTask).
 * Fetches team members for the assignee dropdown if the user is an admin.
 * @param {TaskFormProps} props - The props for the component.
 */
const TaskForm = ({ task, isEditing = false }: TaskFormProps) => {
  const navigate = useNavigate();
  const { addTask, updateTask: updateTaskStatus } = useTaskStore(); // Renamed updateTask to updateTaskStatus for clarity
  const team = useTeamStore((state) => state.team); // For assignee dropdown
  const fetchTeamMembers = useTeamStore((state) => state.fetchTeamMembers);
  const user = useAuthStore((state) => state.user); // For role-based logic (fetching team)
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // Effect to fetch team members if the current user is an admin.
  // This is for populating the "Assign To" dropdown.
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchTeamMembers();
    }
  }, [fetchTeamMembers, user]);

  // Form data state.
  const [formData, setFormData] = useState({
    description: "",
    deadline: "",
    status: "New" as Task["status"], // Default status for new tasks
    assigneeId: "", // Stores the ID of the assignee
  });

  // Effect to populate form data when an existing task is being edited.
  // Runs when 'task' prop changes (e.g., when opening an existing task for editing).
  useEffect(() => {
    if (isEditing && task) {
      setFormData({
        description: task.description || "",
        // Format deadline for the date input field (YYYY-MM-DD).
        deadline: task.deadline
          ? new Date(task.deadline).toISOString().split("T")[0]
          : "",
        status: task.status || "New",
        assigneeId: task.assignedTo || "",
      });
    } else {
      // Reset form for new task creation or if task/isEditing becomes invalid.
      setFormData({
        description: "",
        deadline: "",
        status: "New",
        assigneeId: "",
      });
    }
  }, [task, isEditing]);

  const [errors, setErrors] = useState<Record<string, string>>({}); // Form validation errors.
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission loading state.

  /**
   * Handles changes in form input fields.
   * Updates formData state and clears validation errors for the changed field.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
    }
  };

  /**
   * Validates the form data.
   * Checks for required fields and valid deadline.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to start of day for comparison
      // Deadline cannot be in the past for new tasks. For editing, this might be allowed or handled differently.
      if (deadlineDate < today && !isEditing) {
        newErrors.deadline = "Deadline cannot be in the past for new tasks";
      }
    }
    // Note: Assignee ID and Status validation might be added here if needed.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission.
   * Validates the form, then calls either updateTaskStatus (for edits) or addTask (for new tasks).
   * Navigates to /tasks on successful submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && task && task.taskId) {
        // For editing, only the status can be updated via this form as per current design.
        // To update other fields like description, deadline, assignee, the `updateTask`
        // store method and the API would need to support it, and this form would send those fields.
        // Currently, taskStore.updateTask only accepts (taskId, status).
        await updateTaskStatus(task.taskId, formData.status as Task["status"]);
        addNotification({
          type: "status_update",
          title: "Task Updated",
          message: `Task "${formData.description.substring(
            0,
            30
          )}..." has been updated.`,
        });
      } else {
        // For new task creation.
        const taskCreationData: Pick<
          Task,
          "description" | "deadline" | "assignedTo"
        > = {
          description: formData.description,
          deadline: new Date(formData.deadline).toISOString(), // Ensure ISO format for API
          assignedTo: formData.assigneeId,
        };
        await addTask(taskCreationData);
        addNotification({
          type: "task_assigned",
          title: "New Task Created",
          message: `Task "${formData.description.substring(
            0,
            30
          )}..." has been created.`,
        });
      }
      navigate("/tasks"); // Redirect after successful operation.
    } catch (error: unknown) {
      console.error("Error saving task:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      addNotification({
        type: "error",
        title: "Error Saving Task",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-gray-400">
                <FileText className="h-5 w-5" />
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleChange}
                className={`appearance-none block w-full pl-10 pt-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deadline Field */}
            <div>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                label="Deadline"
                value={formData.deadline}
                onChange={handleChange}
                error={errors.deadline}
                icon={<Calendar className="h-5 w-5 text-gray-400" />}
                fullWidth
              />
            </div>

            {/* Assignee Field (Dropdown) */}
            {/* This field is primarily for admins creating tasks. */}
            {/* For editing, if assignee change is allowed, it would be enabled here. */}
            {/* Non-admins typically don't assign tasks. */}
            <div>
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign To (User ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="assigneeId"
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleChange}
                  // Form is disabled for assigneeId if not admin or if editing and assignee changes are restricted
                  disabled={
                    !user || user.role !== "admin" || (isEditing && !false)
                  } // Example: disable if not admin or if editing
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Unassigned / Select User</option>
                  {team.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} (ID: {member.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Field (Dropdown, only for editing mode) */}
            {isEditing && (
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="New">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions: Cancel and Submit Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/tasks")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
