import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import createSagaMiddleware from 'redux-saga';
import rootReducer from './store/reducer';
import rootSaga from './store/saga';

const saga = createSagaMiddleware();

const middleWares = [saga, thunk];

const composeEnhancers =
  process.env.NODE_ENV === 'development'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose; // add support for Redux dev tools

export default function configureStore() {
  const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middleWares)));
  saga.run(rootSaga);
  return store;
}
