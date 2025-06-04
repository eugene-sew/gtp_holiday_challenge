import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useTeamStore } from "./stores/teamStore";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Tasks from "./pages/tasks/Tasks";
import TaskDetails from "./pages/tasks/TaskDetails";
import CreateTask from "./pages/tasks/CreateTask";
import Team from "./pages/team/Team";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Loading from "./components/ui/Loading";
import { useTaskStore } from "./stores/taskStore";
import SetPassword from "./pages/auth/SetPassword";

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchTeamMembers } = useTeamStore();
  const { fetchTasks } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);

  // Effect to check authentication status when the app loads.
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth(); // Attempt to restore session from Cognito.
      } catch (error) {
        console.error("Initial auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [checkAuth]);

  // Effect to fetch initial data once the user is authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamMembers();
      fetchTasks();
    }
  }, [isAuthenticated, fetchTeamMembers, fetchTasks]);

  // Display a global loading indicator while authentication is being verified.
  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes: Accessible when not logged in */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/set-password" element={<SetPassword />} />
        </Route>

        {/* Protected Routes: Require authentication */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />

          <Route path="/tasks/create" element={<CreateTask />} />
          {/* Team route is admin-only, enforced by ProtectedRoute and within Team component */}
          <Route
            path="/team"
            element={
              <ProtectedRoute adminOnly={true}>
                <Team />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Root path navigation: redirect based on authentication state */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
