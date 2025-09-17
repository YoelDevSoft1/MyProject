// ========================================
// CONTEXTO GLOBAL DE ESTADOS
// ========================================

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ===== TIPOS =====
interface GlobalState {
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
  errors: {
    global: string | null;
    operations: Record<string, string | null>;
  };
  notifications: {
    items: NotificationItem[];
  };
}

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface GlobalStateContextType {
  state: GlobalState;
  setGlobalLoading: (loading: boolean) => void;
  setOperationLoading: (operation: string, loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setOperationError: (operation: string, error: string | null) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearAllErrors: () => void;
}

// ===== ACCIONES =====
type GlobalStateAction =
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_OPERATION_LOADING'; payload: { operation: string; loading: boolean } }
  | { type: 'SET_GLOBAL_ERROR'; payload: string | null }
  | { type: 'SET_OPERATION_ERROR'; payload: { operation: string; error: string | null } }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'CLEAR_ALL_ERRORS' };

// ===== ESTADO INICIAL =====
const initialState: GlobalState = {
  loading: {
    global: false,
    operations: {},
  },
  errors: {
    global: null,
    operations: {},
  },
  notifications: {
    items: [],
  },
};

// ===== REDUCER =====
function globalStateReducer(state: GlobalState, action: GlobalStateAction): GlobalState {
  switch (action.type) {
    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          global: action.payload,
        },
      };

    case 'SET_OPERATION_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          operations: {
            ...state.loading.operations,
            [action.payload.operation]: action.payload.loading,
          },
        },
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          global: action.payload,
        },
      };

    case 'SET_OPERATION_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          operations: {
            ...state.errors.operations,
            [action.payload.operation]: action.payload.error,
          },
        },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: [...state.notifications.items, action.payload],
        },
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: state.notifications.items.filter(item => item.id !== action.payload),
        },
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: [],
        },
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {
          global: null,
          operations: {},
        },
      };

    default:
      return state;
  }
}

// ===== CONTEXTO =====
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// ===== PROVIDER =====
interface GlobalStateProviderProps {
  children: ReactNode;
}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  const setGlobalLoading = (loading: boolean) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading });
  };

  const setOperationLoading = (operation: string, loading: boolean) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { operation, loading } });
  };

  const setGlobalError = (error: string | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  };

  const setOperationError = (operation: string, error: string | null) => {
    dispatch({ type: 'SET_OPERATION_ERROR', payload: { operation, error } });
  };

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notification, id, timestamp } });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  const value: GlobalStateContextType = {
    state,
    setGlobalLoading,
    setOperationLoading,
    setGlobalError,
    setOperationError,
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearAllErrors,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// ===== HOOK =====
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}

// ===== HOOKS ESPECÍFICOS =====
export function useGlobalLoading() {
  const { state, setGlobalLoading } = useGlobalState();
  return {
    loading: state.loading.global,
    setLoading: setGlobalLoading,
  };
}

export function useOperationLoading(operation: string) {
  const { state, setOperationLoading } = useGlobalState();
  return {
    loading: state.loading.operations[operation] || false,
    setLoading: (loading: boolean) => setOperationLoading(operation, loading),
  };
}

export function useGlobalError() {
  const { state, setGlobalError } = useGlobalState();
  return {
    error: state.errors.global,
    setError: setGlobalError,
  };
}

export function useOperationError(operation: string) {
  const { state, setOperationError } = useGlobalState();
  return {
    error: state.errors.operations[operation] || null,
    setError: (error: string | null) => setOperationError(operation, error),
  };
}

export function useNotifications() {
  const { state, addNotification, removeNotification, clearAllNotifications } = useGlobalState();
  return {
    notifications: state.notifications.items,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
}
