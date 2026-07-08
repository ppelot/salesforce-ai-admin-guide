// ============================================================================
// Global app state: Context + useReducer, split into separate state and
// dispatch contexts so dispatch-only consumers don't re-render on every change.
// Persistence is debounced and isolated in storage.ts.
// ============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type {
  AdminMode,
  AppState,
  CopyEvent,
  JourneyId,
  Language,
} from './types';
import {
  clearAll,
  clearJourney,
  defaultState,
  loadState,
  saveState,
  subscribeToStorage,
} from './storage';

export type Action =
  | { type: 'SET_STEP_DONE'; journeyId: JourneyId; stepId: string; done: boolean }
  | { type: 'TOGGLE_CHECK'; journeyId: JourneyId; checkId: string; checked: boolean }
  | { type: 'SET_NOTE'; journeyId: JourneyId; stepId: string; note: string }
  | { type: 'RECORD_COPY'; event: CopyEvent }
  | { type: 'SET_MODE'; mode: AdminMode }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_SELECTED_JOURNEY'; journeyId: JourneyId | null }
  | { type: 'RESET_JOURNEY'; journeyId: JourneyId }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; state: AppState };

const COPY_HISTORY_CAP = 50;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP_DONE': {
      const jp = state.progress[action.journeyId];
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.journeyId]: {
            ...jp,
            steps: { ...jp.steps, [action.stepId]: action.done },
          },
        },
      };
    }
    case 'TOGGLE_CHECK': {
      const jp = state.progress[action.journeyId];
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.journeyId]: {
            ...jp,
            checks: { ...jp.checks, [action.checkId]: action.checked },
          },
        },
      };
    }
    case 'SET_NOTE': {
      const jp = state.progress[action.journeyId];
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.journeyId]: {
            ...jp,
            notes: { ...jp.notes, [action.stepId]: action.note },
          },
        },
      };
    }
    case 'RECORD_COPY': {
      return {
        ...state,
        copyHistory: [action.event, ...state.copyHistory].slice(
          0,
          COPY_HISTORY_CAP,
        ),
      };
    }
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_SELECTED_JOURNEY':
      return { ...state, selectedJourney: action.journeyId };
    case 'RESET_JOURNEY':
      return clearJourney(state, action.journeyId);
    case 'RESET_ALL':
      // Preserve the chosen language across a full reset — resetting progress
      // shouldn't silently switch the user's language back to the default.
      return { ...clearAll(), language: state.language };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<Action> | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced persistence — avoids thrashing localStorage while typing notes.
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // Keep tabs in sync.
  useEffect(() => {
    return subscribeToStorage((s) => dispatch({ type: 'HYDRATE', state: s }));
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (ctx === null) {
    // Defensive: allows components to render in isolation (e.g. tests).
    return defaultState();
  }
  return ctx;
}

export function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (ctx === null) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  return ctx;
}
