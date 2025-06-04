import { ClipboardCheck } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="animate-bounce">
        <ClipboardCheck className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="mt-4 text-lg font-medium text-gray-900">Loading FieldTask</h2>
      <div className="mt-4">
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;