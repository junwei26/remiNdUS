import React from "react";
import { Button, Grid, TextField } from "@material-ui/core";
import { signInWithEmailPassword } from "../../../../../firebaseAuth/email";

const LoginForm = () => {
  const handleSubmitLogIn = (e) => {
    e.preventDefault();
    signInWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
    <form noValidate onSubmit={handleSubmitLogIn}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item style={{ width: "80%" }}>
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
        <Grid item style={{ width: "80%" }}>
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
        <Grid item style={{ width: "80%" }}>
          <Button type="submit" fullWidth variant="contained" color="primary">
            Log In
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default LoginForm;
