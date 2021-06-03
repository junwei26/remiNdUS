import React from "react";
import PropTypes from "prop-types";
// import { TextField, Button, Grid } from "@material-ui/core";
import { Button } from "@material-ui/core";
// import { isNewPasswordValid } from "../../firebaseAuth/userSettings";
import { sendPasswordReset } from "../../firebaseAuth/email";

const PasswordReset = (props) => {
  // const handlePasswordReset = (e) => {
  //   e.preventDefault();
  //   const newPassword = e.target.password.value;
  //   const newPasswordConfirm = e.target.passwordConfirm.value;
  //   if (isNewPasswordValid(newPassword, newPasswordConfirm)) {
  //     return false; // to be worked on
  //   }
  // };

  const handleSendPasswordReset = (e) => {
    e.preventDefault();
    alert(typeof props.email);
    alert(props.email);
    sendPasswordReset(props.email);
  };

  return (
    // <Grid container direction="column" justify="center" alignItems="flex-start">
    //   <form noValidate autoComplete="off" onSubmit={handlePasswordReset}>
    //     <Grid item>
    //       <TextField
    //         required
    //         id="filled-password-input"
    //         name="password"
    //         label="Password"
    //         type="password"
    //         autoComplete="current-password"
    //         variant="filled"
    //       />
    //     </Grid>
    //     <Grid item>
    //       <TextField
    //         id="filled-password-input"
    //         name="passwordConfirm"
    //         label="Confirm Password"
    //         type="password"
    //         autoComplete="current-password"
    //         variant="filled"
    //       />
    //     </Grid>
    //     <Grid item>
    //       <Button variant="contained" color="primary" type="submit">
    //         Reset Password
    //       </Button>
    //     </Grid>
    //   </form>
    // </Grid>

    <Button variant="contained" color="primary" onClick={handleSendPasswordReset}>
      Reset Password
    </Button>
  );
};

PasswordReset.propTypes = {
  email: PropTypes.string,
};

export default PasswordReset;
