import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = '',
  contentClassName = ''
}: CardProps) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow overflow-hidden', className)}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      )}
      <div className={clsx('p-6', contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default Card;