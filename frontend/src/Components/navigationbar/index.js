import React, { useState } from "react";
// import LogInPopup from "./loginpopup";
// import SignUpPopup from "./signuppopup";
// import PasswordReset from "../pages/settingspage/passwordreset";
import { firebaseAuth } from "../../firebase";
import * as userSettings from "../../firebaseAuth/userSettings";
// import { Button, Grid, AppBar, Toolbar, Menu, MenuItem } from "@material-ui/core";
// import SettingsPage from "../pages/settingspage";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import LoginButton from "./loginbutton";
import SettingsButton from "./settingsbutton";
// import SignupButton from "./signupbutton";

// const { REACT_APP_URL } = process.env;

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(userSettings.isLoggedIn()); // bodging in action, probably
  // const [signUpActive, setSignUpActive] = useState(true);
  // const [anchorEl, setAnchorEl] = React.useState(null);

  firebaseAuth.onAuthStateChanged((user) => {
    // set isLoggedIn to true if user is logged in
    user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  // const changeSignUpActive = () => {
  //   setSignUpActive(!signUpActive);
  // };

  // const handleLogOut = () => {
  //   userSettings.signOut();
  // };

  // const handleSettings = () => {
  //   window.location.replace(REACT_APP_URL + "/settings");
  // };

  // const handleClick = (e) => {
  //   setAnchorEl(e.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h6">Navigation Bar</Typography>

        {isLoggedIn ? <SettingsButton /> : <LoginButton />}
      </Toolbar>
    </AppBar>
  );

  // return (
  //   <AppBar position="static">
  //     <Toolbar>
  //       <Grid container direction="row-reverse">
  //         <Grid item>
  //           {isLoggedIn ? (
  //             <>
  //               <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
  //                 Open Menu
  //               </Button>
  //               <Menu
  //                 id="simple-menu"
  //                 anchorEl={anchorEl}
  //                 keepMounted
  //                 open={Boolean(anchorEl)}
  //                 onClose={handleClose}
  //               >
  //                 <MenuItem onClick={handleSettings}>Settings</MenuItem>
  //                 <MenuItem onClick={handleLogOut}>Logout</MenuItem>
  //               </Menu>
  //             </>
  //           ) : (
  //             <Popup trigger={<Button color="inherit">Login</Button>} modal>
  //               {(close) => (
  //                 <Grid container direction="column">
  //                   <Grid container direction="row">
  //                     <Grid item xs={8}></Grid>
  //                     <Button onClick={close} xs={1}>
  //                       X
  //                     </Button>
  //                   </Grid>
  //                   {isLoggedIn ? (
  //                     // If User is logged in, then welcome to the app, allow log out and show user profile detail
  //                     <Grid container direction="column" justify="center" alignItems="center">
  //                       <Grid container direction="column" justify="center" alignItems="center">
  //                         <Grid item>Welcome to the app</Grid>
  //                         <Grid item>
  //                           <Button onClick={handleLogOut} variant="contained" color="primary">
  //                             Log Out
  //                           </Button>
  //                         </Grid>
  //                         <Grid item>
  //                           <SettingsPage />
  //                         </Grid>
  //                       </Grid>
  //                     </Grid>
  //                   ) : (
  //                     // If User is not logged in, then show either sign up or log in component/option
  //                     <Grid container direction="column" alignItems="center" justify="center">
  //                       <Grid container direction="column" justify="center" alignItems="center">
  //                         {/* Need to change to different links instead, replace with <a> and work it out into different pages instead of just conditional rendering */}
  //                         {signUpActive ? (
  //                           <>
  //                             <Grid item>
  //                               <Button onClick={changeSignUpActive}>Click here to log in</Button>
  //                             </Grid>
  //                             <Grid item>
  //                               <SignUpPopup />
  //                             </Grid>
  //                           </>
  //                         ) : (
  //                           <>
  //                             <Grid item>
  //                               <Button onClick={changeSignUpActive}>Click here to sign up</Button>
  //                             </Grid>
  //                             {/* <Grid item>
  //                 <a onClick={resetPassword}>Click here if you forgot your password</a>
  //               </Grid> */}
  //                             <Grid item>
  //                               <LogInPopup />
  //                             </Grid>
  //                             <Grid item>
  //                               <PasswordReset />
  //                             </Grid>
  //                           </>
  //                         )}
  //                       </Grid>
  //                     </Grid>
  //                   )}
  //                 </Grid>
  //               )}
  //             </Popup>
  //           )}
  //         </Grid>
  //       </Grid>
  //     </Toolbar>
  //   </AppBar>
  // );
};

export default NavigationBar;
