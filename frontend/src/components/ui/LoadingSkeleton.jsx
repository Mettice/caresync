import React, { memo } from 'react';

/**
 * Reusable loading skeleton component with various presets
 * @param {Object} props - Component props
 * @param {string} props.type - Preset type ('card', 'table', 'list', 'text', etc.)
 * @param {number} props.count - Number of skeleton items to display
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Custom inline styles
 * @param {boolean} props.animate - Whether to animate the skeleton
 * @returns {JSX.Element} Skeleton component
 */
const LoadingSkeleton = ({ 
  type = 'text', 
  count = 1, 
  className = '', 
  style = {}, 
  animate = true 
}) => {
  // Base skeleton classes
  const baseClasses = `bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`;
  
  // Function to render different types of skeletons
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return Array(count).fill(0).map((_, index) => (
          <div 
            key={`text-skeleton-${index}`} 
            className={`${baseClasses} h-4 mb-2 w-full`} 
            style={style} 
          />
        ));
        
      case 'card':
        return Array(count).fill(0).map((_, index) => (
          <div 
            key={`card-skeleton-${index}`} 
            className="rounded-lg shadow-md overflow-hidden mb-4" 
          >
            <div className={`${baseClasses} h-48 w-full`} />
            <div className="p-4">
              <div className={`${baseClasses} h-6 w-3/4 mb-4`} />
              <div className={`${baseClasses} h-4 w-full mb-2`} />
              <div className={`${baseClasses} h-4 w-full mb-2`} />
              <div className={`${baseClasses} h-4 w-2/3`} />
            </div>
          </div>
        ));
        
      case 'table':
        return (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            {/* Table header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex">
              {Array(5).fill(0).map((_, index) => (
                <div 
                  key={`th-skeleton-${index}`} 
                  className={`${baseClasses} h-6 flex-1 mx-2`} 
                />
              ))}
            </div>
            
            {/* Table rows */}
            {Array(count).fill(0).map((_, rowIndex) => (
              <div 
                key={`tr-skeleton-${rowIndex}`} 
                className="border-b border-gray-200 p-4 flex last:border-b-0"
              >
                {Array(5).fill(0).map((_, colIndex) => (
                  <div 
                    key={`td-skeleton-${rowIndex}-${colIndex}`} 
                    className={`${baseClasses} h-4 flex-1 mx-2`} 
                  />
                ))}
              </div>
            ))}
          </div>
        );
        
      case 'list':
        return Array(count).fill(0).map((_, index) => (
          <div 
            key={`list-skeleton-${index}`} 
            className="flex items-center p-4 border-b border-gray-200 last:border-b-0"
          >
            <div className={`${baseClasses} h-10 w-10 rounded-full mr-3`} />
            <div className="flex-1">
              <div className={`${baseClasses} h-4 w-1/3 mb-2`} />
              <div className={`${baseClasses} h-3 w-2/3`} />
            </div>
            <div className={`${baseClasses} h-8 w-24 rounded-md`} />
          </div>
        ));
        
      case 'profile':
        return (
          <div className="rounded-lg shadow-md overflow-hidden mb-4 p-6">
            <div className="flex items-center mb-6">
              <div className={`${baseClasses} h-16 w-16 rounded-full mr-4`} />
              <div className="flex-1">
                <div className={`${baseClasses} h-6 w-1/3 mb-2`} />
                <div className={`${baseClasses} h-4 w-2/3`} />
              </div>
            </div>
            <div className={`${baseClasses} h-4 w-full mb-3`} />
            <div className={`${baseClasses} h-4 w-full mb-3`} />
            <div className={`${baseClasses} h-4 w-3/4 mb-3`} />
            <div className={`${baseClasses} h-4 w-1/2 mb-6`} />
            <div className={`${baseClasses} h-10 w-full rounded-md`} />
          </div>
        );
        
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(count).fill(0).map((_, index) => (
              <div 
                key={`stats-skeleton-${index}`} 
                className="rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className={`${baseClasses} h-4 w-1/3 mb-2`} />
                <div className={`${baseClasses} h-8 w-1/2 mb-3`} />
                <div className={`${baseClasses} h-3 w-full`} />
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <div 
            className={`${baseClasses} h-4 w-full`} 
            style={style} 
          />
        );
    }
  };
  
  return <>{renderSkeleton()}</>;
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LoadingSkeleton); 