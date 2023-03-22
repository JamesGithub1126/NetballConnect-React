import React, { useEffect } from 'react';
import { Offline } from 'react-detect-offline';
import {
  // MemoryRouter,
  Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
// import FullStory from 'react-fullstory';
import TagManager from 'react-gtm-module';

import Routes from './pages/routes';
import history from './util/history';
import PrivateRoute from './util/protectedRoute';
import Login from './components/login';
import ForgotPassword from './components/ForgotPassword';
import lazyLoad from './components/lazyLoad';
import ErrorBoundary from './components/emptyComponent/errorBoundary';
import Tawk from './components/tawk';
import { Alert } from 'antd';
import './customStyles/customStyles.css';
import './customStyles/antdStyles.css';

// const ORG_ID = 'Netball';
const tagManagerArgs = {
  gtmId: process.env.REACT_APP_GTM_ID,
};

TagManager.initialize(tagManagerArgs);

function App() {
  return (
    <div className="App">
      <Tawk />
      <ErrorBoundary>
        <Offline
          polling={{
            url: 'https://ipv4.icanhazip.com',
            interval: 10000,
            timeout: 10000,
          }}
        >
          <div className="offlineAlert">
            <Alert message="You're offline right now. Check your connection." banner />
          </div>
        </Offline>
        {/* <FullStory org={ORG_ID} /> */}
        {/* <MemoryRouter> */}
        <Router history={history}>
          <Switch>
            <Route
              exact
              path="/"
              render={() =>
                localStorage.token ? <Redirect to="/homeDashboard" /> : <Redirect to="/login" />
              }
            />

            <Route path="/login" component={lazyLoad(Login)} />
            <Route path="/forgotPassword" component={lazyLoad(ForgotPassword)} />

            <PrivateRoute path="/" component={lazyLoad(Routes)} />
          </Switch>
        </Router>
        {/* </MemoryRouter> */}
      </ErrorBoundary>
    </div>
  );
}

export default App;
