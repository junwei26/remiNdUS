import React from "react";
import { Button, Grid, TextField } from "@material-ui/core";
import { sendPasswordReset } from "../../../../../firebaseAuth/email";

const resetPasswordForm = () => {
  const handleSendPasswordReset = (e) => {
    e.preventDefault();
    sendPasswordReset(e.target.email.value);
  };

  return (
    <form noValidate onSubmit={handleSendPasswordReset}>
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
          <Button type="submit" fullWidth variant="contained" color="primary">
            Send Reset Password Email
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default resetPasswordForm;
