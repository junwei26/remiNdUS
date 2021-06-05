import React from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid, Card } from "@material-ui/core";
import { signUpWithEmailPassword } from "../../../../../firebaseAuth/email";

const SignUpPopup = (props) => {
  const handleSubmitSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
    <Card>
      <Grid container direction="column">
        {/* Close prompt button */}
        <Grid item>
          <Button onClick={props.close}>X</Button>
        </Grid>
        {/* Signup form */}
        <Grid item>
          <form noValidate autoComplete="off" onSubmit={handleSubmitSignUp}>
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
              <Grid item>
                <TextField variant="outlined" required fullWidth name="email" label="Email" />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                />
              </Grid>
              <Grid item>
                <Button type="submit" fullWidth variant="contained" color="primary">
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Card>
  );
};

SignUpPopup.propTypes = {
  close: PropTypes.func,
};

export default SignUpPopup;
