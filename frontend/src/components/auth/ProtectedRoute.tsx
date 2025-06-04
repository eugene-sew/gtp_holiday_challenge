import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

type ProtectedRouteProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;