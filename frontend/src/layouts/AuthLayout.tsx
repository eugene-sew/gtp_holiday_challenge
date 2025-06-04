import { Outlet } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <ClipboardCheck className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">FieldTask</h1>
        </div>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;