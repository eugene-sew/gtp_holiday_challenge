import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import TaskForm from '../../components/tasks/TaskForm';

const CreateTask = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Only admin can create tasks
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create a new task
        </p>
      </div>
      
      <TaskForm />
    </div>
  );
};

export default CreateTask;