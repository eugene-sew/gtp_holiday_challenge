import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  hint,
  icon,
  fullWidth = false,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'appearance-none block rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
    error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-400',
    icon && 'pl-10',
    fullWidth ? 'w-full' : 'w-auto',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;