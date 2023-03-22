import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import './style.css';

import App from './App';
import ConfigureStore from './configureStore';
import * as serviceWorker from './serviceWorker';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const store = ConfigureStore();
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
