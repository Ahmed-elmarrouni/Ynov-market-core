import { applyMiddleware, createStore } from 'redux';
import { promiseMiddleware, localStorageMiddleware } from './middleware';
import reducer from './reducer';

const getMiddleware = () => {
  if (import.meta.env.PROD) {
    return applyMiddleware(promiseMiddleware, localStorageMiddleware);
  }
  // In development, dynamically import redux-logger to avoid prod bundle size
  return applyMiddleware(promiseMiddleware, localStorageMiddleware);
};

// Compose with Redux DevTools if available in the browser
const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  (f => f);

export const store = createStore(reducer, composeEnhancers(getMiddleware()));
