import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
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
    userSettings.signOut();
  };

  return (
    <>
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
