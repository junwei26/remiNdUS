import React, { useState } from "react";
import { Button, Grid } from "@material-ui/core";
import * as userSettings from "../../../firebaseAuth/userSettings";
import LogInComponent from "./login";
import SignUpComponent from "./signup";
import { firebaseAuth } from "../../../firebase";

const LandingPage = () => {
  const [signUpActive, setSignUpActive] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(userSettings.isLoggedIn()); // bodging in action, probably

  firebaseAuth.onAuthStateChanged((user) => {
    // set isLoggedIn to true if user is logged in
    user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  const changeSignUpActive = () => {
    setSignUpActive(!signUpActive);
  };

  const handleLogOut = () => {
    userSettings.signOut();
  };

  return (
    <>
      {isLoggedIn ? (
        // If User is logged in, then welcome to the app, allow log out and show user profile detail
        <Grid container direction="row" justify="center" alignItems="center">
          <div>Welcome to the app</div>
          <Button onClick={handleLogOut} variant="contained" color="primary">
            Log Out
          </Button>
        </Grid>
      ) : (
        // If User is not logged in, then show either sign up or log in component/option
        <Grid container direction="row" justify="center" alignItems="center">
          {/* Need to change to different links instead, replace with <a> and work it out into different pages instead of just conditional rendering */}
          <Button onClick={changeSignUpActive}>
            {signUpActive ? "Click here to log in" : "Click here to sign up"}{" "}
          </Button>
          {signUpActive ? <SignUpComponent /> : <LogInComponent />}
        </Grid>
      )}
    </>
  );
};

export default LandingPage;
