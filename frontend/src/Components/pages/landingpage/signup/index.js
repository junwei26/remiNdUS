import React from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid } from "@material-ui/core";
import { signUpWithEmailPassword } from "../../../../firebaseAuth/email";

const SignUpComponent = () => {
  const handleSubmitSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
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
  );
};

SignUpComponent.propTypes = {
  onSubmit: PropTypes.func,
};

export default SignUpComponent;
