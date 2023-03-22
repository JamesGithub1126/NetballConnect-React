import { Route, Redirect } from 'react-router-dom';
import React from 'react';

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (localStorage.token ? <Component {...props} /> : <Redirect to="/login" />)}
    />
  );
};

export default PrivateRoute;
