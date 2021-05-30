import React, { useState } from "react";
import { Button, Grid } from "@material-ui/core";
import * as user from "../firebaseAuth/user";
import LogInComponent from "./LogInComponent";
import SignUpComponent from "./SignUpComponent";
import { signInWithEmailPassword, signUpWithEmailPassword } from "../firebaseAuth/email";
import { firebaseAuth } from "../firebase";

const AccountComponent = () => {
  const [signUpActive, setSignUpActive] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(user.isLoggedIn()); // bodging in action

  firebaseAuth.onAuthStateChanged((user) => {
    // set isLoggedIn to true if user is logged in
    user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  const changeSignUpActive = () => {
    setSignUpActive(!signUpActive);
  };

  const handleSubmitLogIn = (e) => {
    e.preventDefault();
    signInWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  const handleSubmitSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  const handleLogOut = () => {
    user.signOut();
  };

  return (
    <>
      {isLoggedIn ? (
        <Grid container direction="row" justify="center" alignItems="center">
          <div>Welcome to the app</div>
          <Button onClick={handleLogOut} variant="contained" color="primary">
            Log Out
          </Button>
        </Grid>
      ) : (
        <Grid container direction="row" justify="center" alignItems="center">
          <Button onClick={changeSignUpActive} variant="contained">
            {signUpActive ? "Log In" : "Sign Up"}{" "}
          </Button>
          {signUpActive ? (
            <SignUpComponent onSubmit={handleSubmitSignUp} />
          ) : (
            <LogInComponent onSubmit={handleSubmitLogIn} />
          )}
        </Grid>
      )}
    </>
  );
};

export default AccountComponent;
