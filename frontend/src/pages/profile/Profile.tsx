import { HardHat } from "lucide-react";

const Profile = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <HardHat className="h-16 w-16 text-yellow-500" />
      <h1 className="text-2xl font-bold text-gray-900">
        Page Under Construction
      </h1>
      <p className="text-gray-500">
        This page is currently under construction. Please check back later.
      </p>
    </div>
  );
};

export default Profile;
