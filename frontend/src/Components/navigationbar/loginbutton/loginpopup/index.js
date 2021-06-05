import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Button, Grid, Card, Typography } from "@material-ui/core";
import { signInWithEmailPassword } from "../../../../firebaseAuth/email";

const useStyles = makeStyles(() => ({
  topbar: {
    padding: 10,
  },
  title: {
    flexGrow: 1,
  },
}));

const LoginPopup = (props) => {
  const classes = useStyles();

  const handleSubmitLogIn = (e) => {
    e.preventDefault();
    signInWithEmailPassword(e.target.email.value, e.target.password.value);
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
            <Typography>Log In</Typography>
          </Grid>
          <Grid item>
            <Button onClick={props.close}>X</Button>
          </Grid>
        </Grid>
        {/* Login form */}
        <Grid item>
          <form noValidate autoComplete="off" onSubmit={handleSubmitLogIn}>
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
              <Grid item>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="email"
                  label="Email"
                  color="primary"
                  autofocus
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
                  color="primary"
                />
              </Grid>
              <Grid item>
                <Button type="submit" fullWidth variant="contained" color="primary">
                  Log In
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Card>
  );
};

LoginPopup.propTypes = {
  close: PropTypes.func,
};

export default LoginPopup;
