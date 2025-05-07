import { useMemo, useCallback, useState, useEffect, useRef, memo } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Custom hook to memoize an expensive computation
 * @param {Function} computeFunction - The expensive function to memoize
 * @param {Array} dependencies - Dependencies array for memoization
 * @returns {any} Memoized result
 */
export const useMemoizedValue = (computeFunction, dependencies = []) => {
  return useMemo(() => computeFunction(), dependencies);
};

/**
 * Custom hook to memoize an async function that fetches data
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies array for memoization
 * @returns {Object} Data, loading state, and error
 */
export const useMemoizedAsync = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Memoize the fetch function
  const memoizedFetchFn = useCallback(fetchFunction, dependencies);
  
  // Call the fetch function when dependencies change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    memoizedFetchFn()
      .then(result => {
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [memoizedFetchFn]);
  
  return { data, loading, error };
};

/**
 * Custom hook to memoize an object with deep comparison
 * @param {Object} value - The object to memoize
 * @returns {Object} Memoized object that only changes on deep changes
 */
export const useDeepMemo = (value) => {
  const ref = useRef(value);
  
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  
  return ref.current;
};

/**
 * Helper for creating memoized components with custom comparison
 * @param {React.Component} Component - Component to memoize
 * @param {Function} propsAreEqual - Custom comparison function
 * @returns {React.Component} Memoized component
 */
export const createMemoizedComponent = (Component, propsAreEqual) => {
  // Create a display name for the memoized component
  const displayName = Component.displayName || Component.name || 'Component';
  
  // Create wrapper component to log render times
  const PerformanceTrackedComponent = (props) => {
    const renderStart = useRef(performance.now());
    
    useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 5) { // Log if render takes more than 5ms
        console.log(`[Performance] ${displayName} rendered in ${renderTime.toFixed(2)}ms`);
      }
      renderStart.current = performance.now();
    });
    
    return <Component {...props} />;
  };
  
  // Apply memo to the tracked component
  const MemoizedComponent = memo(PerformanceTrackedComponent, propsAreEqual);
  
  // Set appropriate display name
  MemoizedComponent.displayName = `Memo(${displayName})`;
  
  return MemoizedComponent;
};

export default {
  useMemoizedValue,
  useMemoizedAsync,
  useDeepMemo,
  createMemoizedComponent
};