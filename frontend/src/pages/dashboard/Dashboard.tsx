import { useAuthStore } from "../../stores/authStore";
import { useTaskStore } from "../../stores/taskStore";
import { useTeamStore } from "../../stores/teamStore";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Edit3,
  PlusSquare,
  ListTodo,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import TasksChart from "../../components/dashboard/TasksChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import Card from "../../components/ui/Card";
import { Task } from "../../types/task";
import { User } from "../../types/user";

/**
 * @interface DashboardActivity
 * Defines the structure for items displayed in the RecentActivity component on the dashboard.
 * This is a local type tailored for the dashboard's activity feed.
 */
interface DashboardActivity {
  id: string;
  user: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  iconBackground: string;
}

/**
 * Dashboard component: Main view after login.
 * Displays task statistics, a task status chart, recent activity, and upcoming tasks.
 * Adapts content based on user role (admin vs. member).
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const team = useTeamStore((state) => state.team);

  const isAdmin = user?.role === "admin";

  const userTasks = isAdmin
    ? tasks
    : tasks.filter((task) => task.assignedTo === user?.id);

  const inProgressTasks = userTasks.filter(
    (task) => task.status === "in_progress"
  );
  const completedTasks = userTasks.filter(
    (task) => task.status === "completed"
  );
  const toDoTasks = userTasks.filter((task) => task.status === "New");

  const overdueTasks = userTasks.filter((task) => {
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    return deadlineDate < today && task.status !== "completed";
  });

  const chartData = [
    { name: "To Do", value: toDoTasks.length, color: "#6B7280" },
    { name: "In Progress", value: inProgressTasks.length, color: "#3B82F6" },
    { name: "Completed", value: completedTasks.length, color: "#10B981" },
  ];

  /**
   * Transforms a list of tasks into a list of activity items for the dashboard.
   * It infers activity type (created vs. updated) based on createdAt and updatedAt timestamps.
   * User names are resolved from the team store.
   * @param {Task[]} tasksToTransform - The list of tasks to process.
   * @param {User[]} teamMembers - The list of team members to resolve names.
   * @returns {DashboardActivity[]} An array of activity items, sorted by date descending.
   */
  const transformTasksToActivities = (
    tasksToTransform: Task[],
    teamMembers: User[]
  ): DashboardActivity[] => {
    const activities: DashboardActivity[] = [];
    const sortedTasks = [...tasksToTransform].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    for (const task of sortedTasks) {
      const assignee = teamMembers.find((m) => m.id === task.assignedTo);
      const creator = teamMembers.find((m) => m.id === task.createdBy);

      let userName: string;
      if (
        new Date(task.updatedAt).getTime() -
          new Date(task.createdAt).getTime() <
          5000 &&
        creator
      ) {
        userName = creator?.name || "Unknown User";
        activities.push({
          id: `${task.taskId}-created`,
          user: userName,
          description: `Task created: "${task.description.substring(
            0,
            30
          )}..."`,
          date: task.createdAt,
          icon: <PlusSquare className="h-5 w-5 text-white" />,
          iconBackground: "bg-green-500",
        });
      } else {
        userName = assignee?.name || creator?.name || "System";
        activities.push({
          id: `${task.taskId}-updated`,
          user: userName,
          description: `Task "${task.description.substring(
            0,
            30
          )}..." updated to ${task.status.replace("_", " ")}`,
          date: task.updatedAt,
          icon: <Edit3 className="h-5 w-5 text-white" />,
          iconBackground: "bg-blue-500",
        });
      }
    }
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const recentTaskActivities = transformTasksToActivities(
    userTasks,
    team
  ).slice(0, 5);

  const upcomingTasks = userTasks
    .filter((task) => task.status === "New" || task.status === "in_progress")
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? "Overview of all tasks and team activity"
            : "Overview of your assigned tasks and activity"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={userTasks.length}
          icon={<CheckSquare className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="To Do"
          value={toDoTasks.length}
          icon={<ListTodo className="h-6 w-6" />}
          color="gray"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks.length}
          icon={<Clock className="h-6 w-6" />}
          color="teal"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks.length}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TasksChart data={chartData} />
        <RecentActivity activities={recentTaskActivities} />
      </div>

      <div>
        <Card title="Upcoming Tasks">
          <div className="divide-y divide-gray-200">
            {upcomingTasks.length === 0 ? (
              <p className="py-4 text-center text-gray-500">
                No upcoming tasks
              </p>
            ) : (
              upcomingTasks.map((task: Task) => (
                <div
                  key={task.taskId}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div>
                      <p
                        className="text-sm font-medium text-gray-900 truncate w-60"
                        title={task.description}
                      >
                        {task.description.substring(0, 40) +
                          (task.description.length > 40 ? "..." : "")}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.status === "New"
                          ? "bg-gray-100 text-gray-800"
                          : task.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.status === "New"
                        ? "New"
                        : task.status === "in_progress"
                        ? "In Progress"
                        : "Completed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
