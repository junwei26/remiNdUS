import React, { useState } from "react";
import { firebaseAuth } from "../../../firebase";
import * as userSettings from "../../../firebaseAuth/userSettings";
import LogInComponent from "./login";
import SignUpComponent from "./signup";
import UserInfoComponent from "../usersettings";
import PasswordReset from "../usersettings/passwordreset";
import { Button, Grid, AppBar, Toolbar } from "@material-ui/core";
import Popup from "reactjs-popup";

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
    <AppBar position="static">
      <Toolbar>
        <Grid container direction="row-reverse">
          <Grid item>
            <Popup trigger={<Button color="inherit">Login</Button>} modal>
              {(close) => (
                <Grid container direction="column">
                  <Grid container direction="row">
                    <Grid item xs={8}></Grid>
                    <Button onClick={close} xs={1}>
                      X
                    </Button>
                  </Grid>
                  {isLoggedIn ? (
                    // If User is logged in, then welcome to the app, allow log out and show user profile detail
                    <Grid container direction="column" justify="center" alignItems="center">
                      <Grid container direction="column" justify="center" alignItems="center">
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
                    <Grid container direction="column" alignItems="center" justify="center">
                      <Grid container direction="column" justify="center" alignItems="center">
                        {/* Need to change to different links instead, replace with <a> and work it out into different pages instead of just conditional rendering */}
                        {signUpActive ? (
                          <>
                            <Grid item>
                              <Button onClick={changeSignUpActive}>Click here to log in</Button>
                            </Grid>
                            <Grid item>
                              <SignUpComponent />
                            </Grid>
                          </>
                        ) : (
                          <>
                            <Grid item>
                              <Button onClick={changeSignUpActive}>Click here to sign up</Button>
                            </Grid>
                            {/* <Grid item>
                  <a onClick={resetPassword}>Click here if you forgot your password</a>
                </Grid> */}
                            <Grid item>
                              <LogInComponent />
                            </Grid>
                            <Grid item>
                              <PasswordReset />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              )}
            </Popup>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default LandingPage;
