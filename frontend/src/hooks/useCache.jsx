import { useState, useEffect, useCallback, useRef } from 'react';

// In-memory cache store
const globalCache = new Map();

/**
 * Custom hook for caching data with TTL support
 * @param {Object} options - Cache configuration options
 * @param {string} options.key - Unique cache key
 * @param {Function} options.fetchFn - Function to fetch data if not in cache
 * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {boolean} options.enabled - Whether to enable caching (default: true)
 * @returns {Object} Cache state and actions
 */
export const useCache = ({ 
  key, 
  fetchFn, 
  ttl = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
  dependencies = [] 
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Track if component is mounted
  const mounted = useRef(true);
  
  // Initialize from cache if available
  useEffect(() => {
    mounted.current = true;
    
    // Check for cache on mount
    if (enabled && key && globalCache.has(key)) {
      const cachedItem = globalCache.get(key);
      
      // Check if cache is still valid
      if (cachedItem.expires > Date.now()) {
        setData(cachedItem.data);
        setLastUpdated(cachedItem.timestamp);
      } else {
        // Cache expired, remove it
        globalCache.delete(key);
      }
    }
    
    return () => {
      mounted.current = false;
    };
  }, [key, enabled]);
  
  // Function to fetch and cache data
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!key || !fetchFn) return;
    
    // Check cache first unless force refresh
    if (!forceRefresh && enabled && globalCache.has(key)) {
      const cachedItem = globalCache.get(key);
      
      // Use cache if not expired
      if (cachedItem.expires > Date.now()) {
        setData(cachedItem.data);
        setLastUpdated(cachedItem.timestamp);
        return cachedItem.data;
      }
    }
    
    // Fetch fresh data
    setLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchFn();
      
      if (mounted.current) {
        setData(freshData);
        setLastUpdated(Date.now());
        
        // Cache the data if enabled
        if (enabled && key) {
          globalCache.set(key, {
            data: freshData,
            timestamp: Date.now(),
            expires: Date.now() + ttl
          });
        }
        
        return freshData;
      }
    } catch (err) {
      if (mounted.current) {
        console.error('Cache fetch error:', err);
        setError(err);
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [key, fetchFn, ttl, enabled, ...dependencies]);
  
  // Fetch data on mount or when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Clear this cache entry
  const clearCache = useCallback(() => {
    if (!key) return;
    
    globalCache.delete(key);
    setData(null);
    setLastUpdated(null);
  }, [key]);
  
  // Clear the entire cache
  const clearAllCache = useCallback(() => {
    globalCache.clear();
    setData(null);
    setLastUpdated(null);
  }, []);
  
  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchData(true),
    clearCache,
    clearAllCache,
    isStale: lastUpdated ? (Date.now() - lastUpdated) > ttl : true
  };
};

/**
 * Utility function to clear a specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCacheItem = (key) => {
  if (globalCache.has(key)) {
    globalCache.delete(key);
  }
};

/**
 * Utility function to clear all cache entries
 */
export const clearAllCache = () => {
  globalCache.clear();
};

export default useCache; 