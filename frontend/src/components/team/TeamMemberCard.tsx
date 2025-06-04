import { User } from "../../types/user";
import { Task } from "../../types/task";
import { Phone, Mail, CheckSquare } from "lucide-react";

type TeamMemberCardProps = {
  member: User;
  tasks: Task[];
};

const TeamMemberCard = ({ member, tasks }: TeamMemberCardProps) => {
  const assignedTasks = tasks.filter((task) => task.assignedTo === member.id);
  const completedTasks = assignedTasks.filter(
    (task) => task.status === "completed"
  );
  const pendingTasks = assignedTasks.filter(
    (task) => task.status !== "completed"
  );

  const completionRate =
    assignedTasks.length > 0
      ? Math.round((completedTasks.length / assignedTasks.length) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <span className="text-lg font-medium">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{member.role}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center text-sm">
            <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span className="text-gray-600">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center text-sm">
              <Phone className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="text-gray-600">{member.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-gray-600">
              {assignedTasks.length} tasks assigned
            </span>
          </div>
          <span className="font-medium text-gray-900">
            {completionRate}% completed
          </span>
        </div>

        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>

        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>{pendingTasks.length} pending</span>
          <span>{completedTasks.length} completed</span>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
