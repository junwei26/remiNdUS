import React from "react";
import { TextField, Button } from "@material-ui/core";

const PasswordReset = () => {
  return (
    <form noValidate autoComplete="off">
      <div>
        <TextField
          required
          id="filled-password-input"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="filled"
        />
      </div>
      <div>
        <TextField
          id="filled-password-input"
          name="password-confirm"
          label="Confirm Password"
          type="password"
          autoComplete="current-password"
          variant="filled"
        />
      </div>
      <div>
        <Button variant="contained" color="primary" type="submit">
          Reset Password
        </Button>
      </div>
    </form>
  );
};

export default PasswordReset;
