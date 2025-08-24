import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, LinkData, Category, Color } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: Record<string, string> | null;
  links: LinkData[];
  categories: Category[];
  colors: Color[];
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: Record<string, string> | null }
  | { type: 'SET_LINKS'; payload: LinkData[] }
  | { type: 'ADD_LINK'; payload: LinkData }
  | { type: 'UPDATE_LINK'; payload: { id: number; data: Partial<LinkData> } }
  | { type: 'REMOVE_LINK'; payload: number }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: number; data: Partial<Category> } }
  | { type: 'REMOVE_CATEGORY'; payload: number }
  | { type: 'SET_COLORS'; payload: Color[] }
  | { type: 'ADD_COLOR'; payload: Color }
  | { type: 'UPDATE_COLOR'; payload: { id: number; data: Partial<Color> } }
  | { type: 'REMOVE_COLOR'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  theme: null,
  links: [],
  categories: [],
  colors: [],
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        theme: action.payload?.theme || state.theme,
      };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LINKS':
      return { ...state, links: action.payload };
    
    case 'ADD_LINK':
      return { ...state, links: [...state.links, action.payload] };
    
    case 'UPDATE_LINK':
      return {
        ...state,
        links: state.links.map(link =>
          link.id === action.payload.id
            ? { ...link, ...action.payload.data }
            : link
        ),
      };
    
    case 'REMOVE_LINK':
      return {
        ...state,
        links: state.links.filter(link => link.id !== action.payload),
      };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.data }
            : category
        ),
      };
    
    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
    
    case 'SET_COLORS':
      return { ...state, colors: action.payload };
    
    case 'ADD_COLOR':
      return { ...state, colors: [...state.colors, action.payload] };
    
    case 'UPDATE_COLOR':
      return {
        ...state,
        colors: state.colors.map(color =>
          color.id === action.payload.id
            ? { ...color, ...action.payload.data }
            : color
        ),
      };
    
    case 'REMOVE_COLOR':
      return {
        ...state,
        colors: state.colors.filter(color => color.id !== action.payload),
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        ...initialState,
        theme: state.theme, // Keep theme after logout
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific parts of the state
export function useAuth() {
  const { state, dispatch } = useAppContext();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: (user: User) => dispatch({ type: 'SET_USER', payload: user }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
  };
}

export function useTheme() {
  const { state, dispatch } = useAppContext();
  return {
    theme: state.theme,
    setTheme: (theme: Record<string, string> | null) => 
      dispatch({ type: 'SET_THEME', payload: theme }),
  };
}

export function useLinks() {
  const { state, dispatch } = useAppContext();
  return {
    links: state.links,
    setLinks: (links: LinkData[]) => dispatch({ type: 'SET_LINKS', payload: links }),
    addLink: (link: LinkData) => dispatch({ type: 'ADD_LINK', payload: link }),
    updateLink: (id: number, data: Partial<LinkData>) => 
      dispatch({ type: 'UPDATE_LINK', payload: { id, data } }),
    removeLink: (id: number) => dispatch({ type: 'REMOVE_LINK', payload: id }),
  };
}

export function useCategories() {
  const { state, dispatch } = useAppContext();
  return {
    categories: state.categories,
    setCategories: (categories: Category[]) => 
      dispatch({ type: 'SET_CATEGORIES', payload: categories }),
    addCategory: (category: Category) => 
      dispatch({ type: 'ADD_CATEGORY', payload: category }),
    updateCategory: (id: number, data: Partial<Category>) => 
      dispatch({ type: 'UPDATE_CATEGORY', payload: { id, data } }),
    removeCategory: (id: number) => dispatch({ type: 'REMOVE_CATEGORY', payload: id }),
  };
}

export function useColors() {
  const { state, dispatch } = useAppContext();
  return {
    colors: state.colors,
    setColors: (colors: Color[]) => dispatch({ type: 'SET_COLORS', payload: colors }),
    addColor: (color: Color) => dispatch({ type: 'ADD_COLOR', payload: color }),
    updateColor: (id: number, data: Partial<Color>) => 
      dispatch({ type: 'UPDATE_COLOR', payload: { id, data } }),
    removeColor: (id: number) => dispatch({ type: 'REMOVE_COLOR', payload: id }),
  };
}

export function useError() {
  const { state, dispatch } = useAppContext();
  return {
    error: state.error,
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
  };
}