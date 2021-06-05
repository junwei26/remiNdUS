import React, { useState } from "react";
import SignupButton from "./signupbutton";
import LoginButton from "./loginbutton";
import PasswordReset from "./passwordreset";
import { Grid, Button } from "@material-ui/core";

const UserAuthButton = () => {
  const [signUpActive, setSignUpActive] = useState(true);

  const changeSignUpActive = () => {
    setSignUpActive(!signUpActive);
  };

  return signUpActive ? (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <Button onClick={changeSignUpActive}>Click here to log in instead</Button>
      </Grid>
      <Grid item>
        <SignupButton />
      </Grid>
    </Grid>
  ) : (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <Button onClick={changeSignUpActive}>Click here to sign up</Button>
      </Grid>
      <Grid item>
        <LoginButton />
      </Grid>
      <Grid item>
        <PasswordReset />
      </Grid>
    </Grid>
  );
};

export default UserAuthButton;
