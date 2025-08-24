import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: sessionStorage.getItem('loggedIn') === 'true' ? 'session' : null,
  loading: true,
  isAuthenticated: false
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Use the old API directly since it works with sessions
      const api = await import('../api');
      await api.default.post('/auth/login', { username, password });
      
      // Get user profile after successful login
      const profileResponse = await api.default.get('/auth/me');
      const user = {
        id: profileResponse.data.id,
        username: profileResponse.data.username,
        name: profileResponse.data.username, // Backend doesn't return name, use username
        email: `${profileResponse.data.username}@facilita.local`, // Fake email since backend doesn't have it
        is_admin: profileResponse.data.isAdmin,
        theme: profileResponse.data.theme
      };
      
      // Set session storage for compatibility
      sessionStorage.setItem('loggedIn', 'true');
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user, 
          token: 'session' // Use placeholder since we're using sessions
        } 
      });
    } catch (error) {
      sessionStorage.removeItem('loggedIn');
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = (): void => {
    sessionStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedIn');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User): void => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const checkAuth = async (): Promise<void> => {
    const loggedIn = sessionStorage.getItem('loggedIn') === 'true' || 
                     localStorage.getItem('loggedIn') === 'true';
    
    if (!loggedIn) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      // Use the old API directly since it works with sessions
      const api = await import('../api');
      const profileResponse = await api.default.get('/auth/me');
      
      const user = {
        id: profileResponse.data.id,
        username: profileResponse.data.username,
        name: profileResponse.data.username, // Backend doesn't return name, use username
        email: `${profileResponse.data.username}@facilita.local`, // Fake email since backend doesn't have it
        is_admin: profileResponse.data.isAdmin,
        theme: profileResponse.data.theme
      };
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token: 'session' } 
      });
    } catch (error) {
      sessionStorage.removeItem('loggedIn');
      localStorage.removeItem('loggedIn');
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}