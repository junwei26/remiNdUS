import React, { useState } from "react";
import {
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItem,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { signUpWithEmailPassword } from "../../../firebaseAuth/email";

const SignupButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSubmitSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Sign Up">
        <ListItemText primary="SIGN UP" />
      </ListItem>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <form noValidate onSubmit={handleSubmitSignUp}>
          <DialogTitle id="form-dialog-title">Sign Up</DialogTitle>
          <DialogContent>
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
              <Grid item style={{ width: "80%" }}>
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
              <Grid item style={{ width: "80%" }}>
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
              <Grid item style={{ width: "80%" }}>
                <Button type="submit" fullWidth variant="contained" color="primary">
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions></DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default SignupButton;
