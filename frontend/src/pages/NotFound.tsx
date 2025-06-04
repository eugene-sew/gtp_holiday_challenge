import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Page Not Found
        </h1>
        <p className="mt-3 text-base text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Button
            onClick={() => navigate("/")}
            icon={<Home className="h-5 w-5" />}
          >
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
