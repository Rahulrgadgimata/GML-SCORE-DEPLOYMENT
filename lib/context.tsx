'use client';
import React, { createContext, useContext, useEffect, useReducer, startTransition } from 'react';
import { AppData, Match, Team } from './types';
import { loadData, saveData, defaultData } from './store';

type Action =
  | { type: 'SET_DATA'; payload: AppData }
  | { type: 'UPDATE_MATCH'; payload: Match }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'DELETE_MATCH'; payload: string }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string };

function reducer(state: AppData, action: Action): AppData {
  let next: AppData;
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;
    case 'UPDATE_MATCH':
      next = {
        ...state,
        matches: state.matches.map(m => m.id === action.payload.id ? action.payload : m)
      };
      break;
    case 'ADD_MATCH':
      next = { ...state, matches: [...state.matches, action.payload] };
      break;
    case 'DELETE_MATCH':
      next = { ...state, matches: state.matches.filter(m => m.id !== action.payload) };
      break;
    case 'ADD_TEAM':
      next = { ...state, teams: [...state.teams, action.payload] };
      break;
    case 'UPDATE_TEAM':
      next = {
        ...state,
        teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t)
      };
      break;
    case 'DELETE_TEAM':
      next = { ...state, teams: state.teams.filter(t => t.id !== action.payload) };
      break;
    default:
      return state;
  }
  return next;
}

interface ContextValue {
  data: AppData;
  dispatch: React.Dispatch<Action>;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (v: boolean) => void;
  refreshData: () => void;
  hydrated: boolean;
}

const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, defaultData);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  const lastProcessedDataRef = React.useRef(JSON.stringify(defaultData));
  const isFromBackendRef = React.useRef(false);

  useEffect(() => {
    // Check session
    if (sessionStorage.getItem('gm_admin') === 'true') {
      setIsAdminLoggedIn(true);
    }
    
    // One-time clean reset
    if (!localStorage.getItem('gm_v3_reset')) {
        localStorage.clear();
        localStorage.setItem('gm_v3_reset', 'true');
    }
    
    const loadInitialData = async () => {
        try {
            const res = await fetch(`/api/data?t=${Date.now()}`, {
                headers: { 'ngrok-skip-browser-warning': '69420' },
                cache: 'no-store'
            });
            if (res.ok) {
                const fetchedData = await res.json();
                isFromBackendRef.current = true;
                lastProcessedDataRef.current = JSON.stringify(fetchedData);
                dispatch({ type: 'SET_DATA', payload: fetchedData });
            }
        } catch (err) { /* silent */ }
        finally { setHydrated(true); }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/data?t=${Date.now()}`, {
            headers: { 'ngrok-skip-browser-warning': '69420' },
            cache: 'no-store'
        });
        if (res.ok) {
          const freshData = await res.json();
          const freshStr = JSON.stringify(freshData);
          if (freshStr !== lastProcessedDataRef.current) {
            isFromBackendRef.current = true;
            lastProcessedDataRef.current = freshStr;
            dispatch({ type: 'SET_DATA', payload: freshData });
          }
        }
      } catch (err) { /* silent */ }
    }, 15000); // Poll every 15s to be safe

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
        const currentDataStr = JSON.stringify(data);
        
        // If this update came from backend (Initial load or Poll), don't POST back
        if (isFromBackendRef.current) {
            isFromBackendRef.current = false;
            lastProcessedDataRef.current = currentDataStr;
            return;
        }

        // If data hasn't changed since last sync, don't POST
        if (currentDataStr === lastProcessedDataRef.current) {
            return;
        }

        const syncData = async () => {
            try {
                await fetch('/api/data', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    body: currentDataStr,
                    cache: 'no-store'
                });
                lastProcessedDataRef.current = currentDataStr;
            } catch (err) { /* silent */ }
        };
        syncData();
    }
  }, [data, hydrated]);

  const contextValue = React.useMemo(() => ({
    data,
    dispatch,
    isAdminLoggedIn,
    setIsAdminLoggedIn: (v: boolean) => {
      if (typeof window !== 'undefined') {
        if (v) sessionStorage.setItem('gm_admin', 'true');
        else sessionStorage.removeItem('gm_admin');
      }
      setIsAdminLoggedIn(v);
    },
    refreshData: async () => {
        const res = await fetch(`/api/data?t=${Date.now()}`, {
            headers: { 'ngrok-skip-browser-warning': '69420' },
            cache: 'no-store'
        });
        if (res.ok) {
            const fresh = await res.json();
            dispatch({ type: 'SET_DATA', payload: fresh });
        }
    },
    hydrated,
  }), [data, isAdminLoggedIn, hydrated]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
