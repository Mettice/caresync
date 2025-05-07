import { useState, useEffect, lazy, Suspense } from 'react';

/**
 * Custom hook for lazy loading components
 * @param {Function} importFn - Dynamic import function for the component
 * @param {React.Component} fallback - Component to show while loading
 * @returns {Object} Lazy loaded component wrapped in Suspense
 */
export const useLazyComponent = (importFn, fallback = null) => {
  const [LazyComponent, setLazyComponent] = useState(null);

  useEffect(() => {
    // Create a lazy-loaded component using React.lazy
    const Component = lazy(importFn);
    
    // Wrap the lazy component in Suspense
    const WrappedComponent = (props) => (
      <Suspense fallback={fallback || <div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
    
    setLazyComponent(() => WrappedComponent);
  }, [importFn, fallback]);

  return { Component: LazyComponent };
};

export default useLazyComponent; 