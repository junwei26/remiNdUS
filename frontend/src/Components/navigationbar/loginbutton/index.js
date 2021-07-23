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
import { signInWithEmailPassword, sendPasswordReset } from "../../../firebaseAuth/email";

const LoginPopup = () => {
  const [loginActive, setLoginActive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const flipLoginActive = () => {
    setLoginActive(!loginActive);
  };

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (loginActive) {
      signInWithEmailPassword(e.target.email.value, e.target.password.value);
    } else {
      sendPasswordReset(e.target.email.value);
    }
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Log In">
        <ListItemText primary="LOG IN" />
      </ListItem>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <form noValidate onSubmit={handleSubmitForm}>
          <DialogTitle id="form-dialog-title">
            {loginActive ? "Login" : "Forgot Password"}
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                {loginActive ? (
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                  >
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
                ) : (
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                  >
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
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {loginActive ? (
              <Button onClick={flipLoginActive}>Forgot password?</Button>
            ) : (
              <Button onClick={flipLoginActive}>Back</Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default LoginPopup;
