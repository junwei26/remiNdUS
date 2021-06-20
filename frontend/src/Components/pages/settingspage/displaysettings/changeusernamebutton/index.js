import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Dialog,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import axios from "axios";
import PropTypes from "prop-types";
import { firebaseAuth } from "../../../../../firebase";

const useStyles = makeStyles(() => ({
  button: {
    justifyContent: "flex-start",
    paddingTop: "5%",
    paddingBottom: "5%",
  },
}));

const ChangeUsernameButton = (props) => {
  const classes = useStyles();
  const [username, setUsername] = useState(props.username);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
    setUsername(props.username); // botching because it is not being correctly set on its own
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogSave = () => {
    const updatedSettings = {
      uid: firebaseAuth.currentUser.uid,
      username: username,
    };
    axios
      .post(
        "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/updateUsername",
        updatedSettings
      )
      .then(() => {
        alert("Succesfully updated username");
        props.setUsername(username);
      })
      .catch((error) => {
        alert(
          `Issue updating username. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
    handleDialogClose();
  };

  return (
    <>
      <Button
        className={classes.button}
        variant="outlined"
        color="primary"
        onClick={handleDialogClickOpen}
      >
        <Typography>Username: {props.username ? props.username : "Not set-up"}</Typography>
      </Button>
      <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change Username</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            required
            fullWidth
            name="username"
            label="New Username"
            defaultValue={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            color="primary"
            autofocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={closeDialogSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ChangeUsernameButton.propTypes = {
  username: PropTypes.String,
  setUsername: PropTypes.func,
};

export default ChangeUsernameButton;
