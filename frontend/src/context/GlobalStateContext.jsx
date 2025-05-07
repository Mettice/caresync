import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' || false,
  notifications: [],
  pendingApiCalls: 0,
  lastAction: null,
  userPreferences: JSON.parse(localStorage.getItem('userPreferences')) || {
    dashboardLayout: 'default',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    notifications: {
      email: true,
      inApp: true,
      sms: false
    }
  }
};

// Action types
export const ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  START_API_CALL: 'START_API_CALL',
  FINISH_API_CALL: 'FINISH_API_CALL',
  SET_USER_PREFERENCE: 'SET_USER_PREFERENCE',
  BATCH_ACTIONS: 'BATCH_ACTIONS'
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_THEME:
      localStorage.setItem('theme', action.payload);
      return {
        ...state,
        theme: action.payload,
        lastAction: action.type
      };
      
    case ACTIONS.TOGGLE_SIDEBAR:
      const newSidebarState = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', newSidebarState);
      return {
        ...state,
        sidebarCollapsed: newSidebarState,
        lastAction: action.type
      };
      
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), ...action.payload }
        ],
        lastAction: action.type
      };
      
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
        lastAction: action.type
      };
      
    case ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        lastAction: action.type
      };
      
    case ACTIONS.START_API_CALL:
      return {
        ...state,
        pendingApiCalls: state.pendingApiCalls + 1,
        lastAction: action.type
      };
      
    case ACTIONS.FINISH_API_CALL:
      return {
        ...state,
        pendingApiCalls: Math.max(0, state.pendingApiCalls - 1),
        lastAction: action.type
      };
      
    case ACTIONS.SET_USER_PREFERENCE:
      const { section, key, value } = action.payload;
      const updatedPreferences = {
        ...state.userPreferences,
        [section]: section === undefined 
          ? value 
          : {
              ...state.userPreferences[section],
              [key]: value
            }
      };
      
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      
      return {
        ...state,
        userPreferences: updatedPreferences,
        lastAction: action.type
      };
      
    case ACTIONS.BATCH_ACTIONS:
      // Apply multiple actions at once
      return action.payload.reduce((nextState, batchedAction) => {
        return reducer(nextState, batchedAction);
      }, state);
      
    default:
      return state;
  }
};

// Create the context
const GlobalStateContext = createContext();

// Provider component
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Action creators for common operations
  const actions = {
    setTheme: (theme) => dispatch({ 
      type: ACTIONS.SET_THEME, 
      payload: theme 
    }),
    
    toggleSidebar: () => dispatch({ 
      type: ACTIONS.TOGGLE_SIDEBAR 
    }),
    
    addNotification: (notification) => dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: notification
    }),
    
    removeNotification: (id) => dispatch({
      type: ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    }),
    
    clearNotifications: () => dispatch({
      type: ACTIONS.CLEAR_NOTIFICATIONS
    }),
    
    startApiCall: () => dispatch({
      type: ACTIONS.START_API_CALL
    }),
    
    finishApiCall: () => dispatch({
      type: ACTIONS.FINISH_API_CALL
    }),
    
    setUserPreference: (section, key, value) => dispatch({
      type: ACTIONS.SET_USER_PREFERENCE,
      payload: { section, key, value }
    }),
    
    batchActions: (actions) => dispatch({
      type: ACTIONS.BATCH_ACTIONS,
      payload: actions
    })
  };
  
  // Create optimized API that wraps dispatch
  const dispatchWithBatching = useCallback((action) => {
    // If we're in the middle of a batch, add to the batch
    // This is useful for when you need to dispatch multiple actions at once
    if (typeof action === 'function') {
      return action(dispatch, () => state);
    }
    return dispatch(action);
  }, [state]);
  
  return (
    <GlobalStateContext.Provider value={{ state, dispatch: dispatchWithBatching, actions }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use the context
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  
  return context;
};

export default { GlobalStateProvider, useGlobalState }; 