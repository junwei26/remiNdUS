import React, { useState, useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";
import { firebaseAuth } from "../../firebase";

const ProtectedRoute = (props) => {
  const [authState, setAuthState] = useState({ authenticated: false, initializing: true });

  useEffect(
    () =>
      firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          setAuthState({ authenticated: true, initializing: false });
        } else {
          setAuthState({ authenticated: false, initializing: false });
        }
      }),
    [setAuthState]
  );

  if (authState.initializing) {
    return <div> Loading </div>;
  } else {
    return authState.authenticated ? (
      <Route exact={props.exact} path={props.path} component={props.component} />
    ) : (
      <Redirect to="/" />
    );
  }
};

ProtectedRoute.defaultProps = {
  exact: true,
};

ProtectedRoute.propTypes = {
  component: PropTypes.any,
  path: PropTypes.string,
  exact: PropTypes.bool,
};

export default ProtectedRoute;
