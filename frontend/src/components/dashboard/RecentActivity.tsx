import { formatDistanceToNow } from 'date-fns';
import Card from '../ui/Card';
import { Activity } from '../../types/activity';

type RecentActivityProps = {
  activities: Activity[];
};

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <Card title="Recent Activity" className="h-full">
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.length === 0 ? (
            <li className="text-center py-4 text-gray-500">No recent activity</li>
          ) : (
            activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.iconBackground}`}>
                        {activity.icon}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {activity.user}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {activity.description}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </Card>
  );
};

export default RecentActivity;