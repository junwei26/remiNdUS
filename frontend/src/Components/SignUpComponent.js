import React from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { signUpWithEmailPassword } from "../firebaseAuth/email";

// Change to a pop-up in the future

const classes = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
}));

const SignUpComponent = () => {
  const handleSubmitSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
    <form className={classes.root} noValidate autoComplete="off" onSubmit={handleSubmitSignUp}>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <TextField
            required
            id="filled-required"
            name="email"
            label="Email"
            defaultValue="test@domain.com"
            variant="filled"
          />
        </Grid>
        <Grid item>
          <TextField
            id="filled-password-input"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            variant="filled"
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" type="submit">
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
