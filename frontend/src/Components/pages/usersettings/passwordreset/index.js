import React from "react";
import PropTypes from "prop-types";
import { Button, Grid, TextField } from "@material-ui/core";
import { sendPasswordReset } from "../../../../firebaseAuth/email";

// Change to a pop-up in the future

const PasswordReset = () => {
  const handleSendPasswordReset = (e) => {
    e.preventDefault();
    alert(`Password reset email sent to ${e.target.email.value}`);
    sendPasswordReset(e.target.email.value);
  };

  return (
    <form noValidate autoComplete="off" onSubmit={handleSendPasswordReset}>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <TextField required id="filled-required" name="email" label="Email" variant="filled" />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" type="submit">
            Send Reset Password Email
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

PasswordReset.propTypes = {
  email: PropTypes.string,
};

export default PasswordReset;
