import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  color?: 'blue' | 'teal' | 'amber' | 'red' | 'gray';
}

const StatCard = ({ title, value, icon, trend, color = 'blue' }: StatCardProps) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={clsx(
            'flex-shrink-0 rounded-md p-3',
            colorStyles[color]
          )}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div className={clsx(
                  'ml-2 flex items-baseline text-sm font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  <span className="sr-only">{trend.isPositive ? 'Increased' : 'Decreased'} by</span>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;