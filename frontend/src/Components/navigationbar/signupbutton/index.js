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
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  listItemText: {
    fontSize: "1.7em",
    color: "white", //Insert your required size
  },
}));

const SignupButton = () => {
  const classes = useStyles();
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
      <ListItem
        button
        onClick={handleDialogClickOpen}
        key="Sign Up"
        color="primary"
        style={{
          borderRadius: 10,
          backgroundColor: "#3f51b5",
          padding: "5px 15px",
          fontSize: "18px",
        }}
      >
        <ListItemText primary="Get Started" classes={{ primary: classes.listItemText }} />
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
