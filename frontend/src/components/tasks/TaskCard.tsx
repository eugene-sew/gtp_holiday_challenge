import { useNavigate } from "react-router-dom";
import { Calendar, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Task } from "../../types/task";
import { clsx } from "clsx";
import { useTeamStore } from "../../stores/teamStore";
import { useAuthStore } from "../../stores/authStore";

/**
 * @interface TaskCardProps
 * Defines the props for the TaskCard component.
 */
type TaskCardProps = {
  task: Task;
};

/**
 * @constant statusColors
 * Maps task status (and overdue state) to Tailwind CSS classes for background and text color.
 */
const statusColors = {
  New: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

/**
 * @constant statusLabel
 * Maps task status (and overdue state) to human-readable labels.
 */
const statusLabel = {
  New: "New",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

/**
 * TaskCard component: Displays a summary of a task in a card format.
 * Shows task description (truncated), status, deadline, and assignee.
 * Navigates to the task details page on click.
 * Adapts assignee display for non-admin users viewing tasks assigned to them.
 * Highlights urgent tasks with a subtle pulse animation.
 * @param {TaskCardProps} props - The props for the component.
 */
const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();
  const team = useTeamStore((state) => state.team);
  const { user } = useAuthStore();

  const isOverdue =
    new Date(task.deadline) < new Date() && task.status !== "completed";
  const displayStatus = isOverdue ? "overdue" : task.status;

  const deadlineDate = new Date(task.deadline);
  const today = new Date();
  const daysUntilDeadline = Math.floor(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );
  const isUrgent =
    daysUntilDeadline <= 1 && !isOverdue && task.status !== "completed";

  const assigneeUser = task.assignedTo
    ? team.find((member) => member.id === task.assignedTo)
    : null;

  let assigneeName = "Unassigned";

  if (user?.role !== "admin" && task.assignedTo === user?.id) {
    assigneeName = "Assigned to you";
  } else if (assigneeUser) {
    assigneeName = assigneeUser.name;
  }

  return (
    <div
      onClick={() => navigate(`/tasks/${task.taskId}`)}
      className={clsx(
        "bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-150 cursor-pointer",
        isUrgent && "animate-pulse-subtle border-amber-300"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3
          className="text-lg font-semibold text-gray-900 line-clamp-1"
          title={task.description}
        >
          {task.description.substring(0, 50) +
            (task.description.length > 50 ? "..." : "")}
        </h3>
        <div
          className={clsx(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColors[displayStatus as keyof typeof statusColors] ||
              statusColors.New
          )}
        >
          {statusLabel[displayStatus as keyof typeof statusLabel] ||
            statusLabel.New}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="border-t border-gray-100 pt-3 mt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              Due{" "}
              {formatDistanceToNow(new Date(task.deadline), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <UserIcon className="h-3 w-3 mr-1" />
            <span>{assigneeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
