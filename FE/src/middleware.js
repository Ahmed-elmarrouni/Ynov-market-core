import { setToken } from './agent';
import {
  ASYNC_START,
  ASYNC_END,
  LOGIN,
  LOGOUT,
  REGISTER,
  ARTICLE_SUBMITTED,
  DELETE_ARTICLE,
} from './constants/actionTypes';

export const SHOW_TOAST = 'SHOW_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';

const SUCCESS_ACTIONS = new Set([
  LOGIN,
  REGISTER,
  ARTICLE_SUBMITTED,
  DELETE_ARTICLE,
  'SETTINGS_SAVED',
  'ADD_COMMENT',
  'DELETE_COMMENT',
  'FOLLOW_USER',
  'UNFOLLOW_USER',
]);

const SUCCESS_MESSAGES = {
  [LOGIN]: 'Welcome back! You are signed in.',
  [REGISTER]: 'Account created! Welcome to Conduit.',
  [ARTICLE_SUBMITTED]: 'Article published successfully!',
  [DELETE_ARTICLE]: 'Article deleted.',
  SETTINGS_SAVED: 'Settings saved.',
  ADD_COMMENT: 'Comment posted.',
  DELETE_COMMENT: 'Comment deleted.',
  FOLLOW_USER: 'You are now following this user.',
  UNFOLLOW_USER: 'Unfollowed.',
};

const saveToken = jwt => {
  window.localStorage.setItem('jwt', jwt);
  setToken(jwt);
};

const clearToken = () => {
  window.localStorage.removeItem('jwt');
  setToken(null);
};

const promiseMiddleware = store => next => action => {
  if (isPromise(action.payload)) {
    store.dispatch({ type: ASYNC_START, subtype: action.type });

    const currentView = store.getState().viewChangeCounter;
    const skipTracking = action.skipTracking;

    action.payload.then(
      res => {
        const currentState = store.getState();
        if (!skipTracking && currentState.viewChangeCounter !== currentView) {
          return;
        }
        action.payload = res;
        store.dispatch({ type: ASYNC_END, promise: action.payload });
        store.dispatch(action);
      },
      error => {
        const currentState = store.getState();
        if (!skipTracking && currentState.viewChangeCounter !== currentView) {
          return;
        }

        // --- THE 401 FIX: Auto-flush dead tokens ---
        if (error.status === 401) {
          clearToken();
        }

        action.error = true;
        action.payload = error.response
          ? error.response.body
          : { errors: { network: ['Server unreachable or blocked by CORS'] } };

        if (!action.skipTracking) {
          store.dispatch({ type: ASYNC_END, promise: action.payload });
        }
        store.dispatch(action);
      }
    );

    return;
  }

  next(action);
};

const localMiddleware = store => next => action => {
  if (action.type === LOGIN || action.type === REGISTER) {
    if (!action.error && action.payload && action.payload.user) {
      saveToken(action.payload.user.token);
    }
  }

  if (action.type === LOGOUT) {
    clearToken();
  }

  if (action.type === ASYNC_END) {
    if (action.promise && action.promise.errors) {
      const errors = action.promise.errors;
      const messages = Object.keys(errors)
        .map(key => {
          const arr = errors[key];
          return Array.isArray(arr) ? `${key} ${arr.join(', ')}` : String(arr);
        })
        .join(' | ');
      store.dispatch({
        type: SHOW_TOAST,
        payload: { kind: 'error', message: messages || 'Something went wrong.' },
      });
    }
  }

  if (!action.error && SUCCESS_ACTIONS.has(action.type)) {
    const msg = SUCCESS_MESSAGES[action.type] || 'Done!';
    store.dispatch({
      type: SHOW_TOAST,
      payload: { kind: 'success', message: msg },
    });
  }

  next(action);
};

function isPromise(v) {
  return v && typeof v.then === 'function';
}

export { promiseMiddleware, localMiddleware };