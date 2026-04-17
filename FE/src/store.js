import { applyMiddleware, createStore } from 'redux';
import { promiseMiddleware, localMiddleware } from './middleware';
import reducer from './reducer';

const getMiddleware = () => applyMiddleware(promiseMiddleware, localMiddleware);

// Compose with Redux DevTools if available in the browser
const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  (f => f);

export const store = createStore(reducer, composeEnhancers(getMiddleware()));
