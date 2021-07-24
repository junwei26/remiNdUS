import React, { useState } from "react";
import { Button, Menu, MenuItem, Snackbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import * as userSettings from "../../../firebaseAuth/userSettings";

const { REACT_APP_URL } = process.env;

const useStyles = makeStyles(() => ({
  menuItem: {
    width: 113,
  },
}));

const AccountButton = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);

  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = () => {
    window.location.replace(REACT_APP_URL + "/settings");
  };

  const handleLogout = () => {
    if (userSettings.signOut()) {
      setCurrentAlert({ severity: "success", message: "Sign Out Successful. See you again!" });
      setSnackbarOpen(true);
    } else {
      setCurrentAlert({ severity: "error", message: "Error: Unable to sign out" });
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
      >
        My Account
      </Button>
      <Menu
        className={classes.menu}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem className={classes.menuItem} onClick={handleSettings}>
          Settings
        </MenuItem>
        <MenuItem className={classes.menuItem} onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountButton;
