import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Button, Grid, Card } from "@material-ui/core";
import { signUpWithEmailPassword } from "../../../../firebaseAuth/email";

const useStyles = makeStyles(() => ({
  topbar: {
    padding: 10,
  },
  title: {
    flexGrow: 1,
  },
}));

const SignUpPopup = (props) => {
  const classes = useStyles();

  const handleSubmitSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
    <Card>
      <Grid container direction="column">
        {/* Close prompt button */}
        <Grid
          container
          className={classes.topbar}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item className={classes.title}>
            <span>Sign Up</span>
          </Grid>
          <Grid item>
            <Button onClick={props.close}>X</Button>
          </Grid>
        </Grid>
        {/* Signup form */}
        <Grid item>
          <form noValidate autoComplete="off" onSubmit={handleSubmitSignUp}>
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
              <Grid item>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                />
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