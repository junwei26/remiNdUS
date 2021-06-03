import React, { useState } from "react";
import { Button, Grid } from "@material-ui/core";
import * as userSettings from "../firebaseAuth/userSettings";
import LogInComponent from "./LogInComponent";
import SignUpComponent from "./SignUpComponent";
import { firebaseAuth } from "../firebase";
import UserInfoComponent from "./UserSettings/UserInfoComponent";

const AccountComponent = () => {
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
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          style={{ minHeight: "50vh" }}
        >
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            style={{
              width: "50%",
            }}
          >
            <Grid item>Welcome to the app</Grid>
            <Grid item>
              <Button onClick={handleLogOut} variant="contained" color="primary">
                Log Out
              </Button>
            </Grid>
            <Grid item>
              <UserInfoComponent />
            </Grid>
          </Grid>
        </Grid>
      ) : (
        // If User is not logged in, then show either sign up or log in component/option
        <Grid
          container
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: "50vh" }}
        >
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            style={{
              width: "50%",
            }}
          >
            {/* Need to change to different links instead, replace with <a> and work it out into different pages instead of just conditional rendering */}
            <Grid item>
              <Button onClick={changeSignUpActive}>
                {signUpActive ? "Click here to log in" : "Click here to sign up"}{" "}
              </Button>
            </Grid>
            <Grid item>{signUpActive ? <SignUpComponent /> : <LogInComponent />}</Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default AccountComponent;
