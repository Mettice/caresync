// Authentication hooks
export { useAuth, AuthProvider } from './useAuth.jsx';

// Dashboard and UI state hooks
export { useDashboard } from './useDashboard';
export { useBranches } from './useBranches';
export { useUIState } from './useUIState';

// Form handling hooks
export { useForm } from './useForm';

// API handling hooks
export { useApi, createApiHooks } from './useApi';

// Data management hooks
export { useCache, clearCacheItem, clearAllCache } from './useCache';

// Performance optimization hooks
export { useLazyComponent } from './useLazyComponent';
export { 
  useMemoizedValue, 
  useMemoizedAsync, 
  useDeepMemo, 
  createMemoizedComponent 
} from './useMemoization';

// Create pre-configured API hooks
import apiService from '../lib/api-service';
export const apiHooks = createApiHooks(apiService);