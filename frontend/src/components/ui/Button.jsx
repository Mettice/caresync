import React from 'react';

/**
 * Button component with standardized styling
 * @param {Object} props
 * @param {ReactNode} props.children - Button content
 * @param {string} props.className - Additional class names
 * @param {string} props.variant - Button style variant ('default', 'outline', 'secondary', etc.)
 * @param {Object} props.rest - All other props passed to the button element
 */
const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const getClasses = () => {
    const baseClasses = 'rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      default: 'bg-caresync-dark hover:bg-caresync-accent text-white shadow-md hover:shadow-lg py-3 px-6',
      outline: 'border border-caresync-dark text-caresync-dark hover:bg-gray-50 py-3 px-6',
      secondary: 'bg-caresync-primary hover:bg-caresync-secondary text-white shadow-sm py-3 px-6',
      subtle: 'bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4',
      ghost: 'hover:bg-gray-100 text-gray-700 py-2 px-4',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm py-2 px-4',
      link: 'text-caresync-primary hover:underline px-2 py-1',
      icon: 'p-2 rounded-full hover:bg-gray-100'
    };
    
    const sizeClasses = props.size === 'sm' ? 'text-xs' : 
                         props.size === 'lg' ? 'text-lg' : 
                         'text-sm';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses} ${className}`;
  };
  
  return (
    <button 
      className={getClasses()}
      type={props.type || 'button'}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 