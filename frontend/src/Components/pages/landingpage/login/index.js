import React from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid } from "@material-ui/core";
import { signInWithEmailPassword } from "../../../../firebaseAuth/email";

const LogInComponent = () => {
  const handleSubmitLogIn = (e) => {
    e.preventDefault();
    signInWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
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
  );
};

LogInComponent.propTypes = {
  onSubmit: PropTypes.func,
};

export default LogInComponent;
