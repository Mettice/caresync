import React from 'react';
import Dashboard from './Dashboard';
import { memo as reactMemo } from 'react';
import apiService from '../lib/api-service';

// Create a memoized version of the Dashboard component
// This prevents unnecessary rerenders
const MemoizedDashboard = reactMemo(
  (props) => <Dashboard {...props} apiService={apiService} />,
  // Custom comparison function - always return true to prevent rerender
  () => true
);

export default MemoizedDashboard; 