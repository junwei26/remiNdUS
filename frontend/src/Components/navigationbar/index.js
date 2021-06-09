import React, { useState } from "react";
import { firebaseAuth } from "../../firebase";
import * as userSettings from "../../firebaseAuth/userSettings";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Grid, IconButton } from "@material-ui/core";
import AccountButton from "./accountbutton";
import SignupButton from "./signupbutton";
import LoginButton from "./loginbutton";
// import HomeIcon from "@material-ui/icons/Home";

const { REACT_APP_URL } = process.env;

const useStyles = makeStyles((theme) => ({
  appbar: {
    margin: 0,
    flexGrow: 1,
    position: "relative",
    zIndex: theme.zIndex.drawer + 1,
  },
  homeButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const NavigationBar = () => {
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(userSettings.isLoggedIn());

  firebaseAuth.onAuthStateChanged((user) => {
    // set isLoggedIn to true if user is logged in
    user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  const handleClickHome = () => {
    window.location.replace(REACT_APP_URL + "/dashboard");
  };

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar>
        {isLoggedIn ? (
          <IconButton
            edge="start"
            className={classes.homeButton}
            color="inherit"
            aria-label="home"
            onClick={handleClickHome}
          ></IconButton>
        ) : (
          <div></div>
        )}
        <Typography className={classes.title} variant="h6">
          Navigation Bar
        </Typography>

        {isLoggedIn ? (
          <div>
            <AccountButton />
          </div>
        ) : (
          <div>
            <Grid container direction="row" justify="center" alignItems="center">
              <Grid item>
                <LoginButton />
              </Grid>
              <Grid item>
                <SignupButton />
              </Grid>
            </Grid>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
