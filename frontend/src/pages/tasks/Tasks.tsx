import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../../stores/taskStore";
import { useAuthStore } from "../../stores/authStore";
import { Plus, Search, Filter, List, GridIcon } from "lucide-react";
import Button from "../../components/ui/Button";
import TaskCard from "../../components/tasks/TaskCard";
import Input from "../../components/ui/Input";

const Tasks = () => {
  const navigate = useNavigate();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userTasks = tasks;

  const filteredTasks = userTasks.filter((task) => {
    const matchesSearch = task.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "overdue"
        ? new Date(task.deadline) < new Date() && task.status !== "completed"
        : task.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === "admin"
              ? "Manage and track all tasks"
              : "View and manage your assigned tasks"}
          </p>
        </div>
        {user?.role === "admin" && (
          <Button
            onClick={() => navigate("/tasks/create")}
            icon={<Plus className="h-5 w-5" />}
          >
            Create Task
          </Button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search tasks by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5 text-gray-400" />}
              fullWidth
              className="p-2 py-3 "
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 py-3"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex justify-end">
            <div className="bg-gray-100 rounded-md p-1 flex">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <GridIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${
                  viewMode === "list"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Filter className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          {user?.role === "admin" && (
            <div className="mt-6">
              <Button
                onClick={() => navigate("/tasks/create")}
                icon={<Plus className="h-5 w-5" />}
              >
                Create New Task
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {filteredTasks.map((task) => (
            <TaskCard key={task.taskId} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
