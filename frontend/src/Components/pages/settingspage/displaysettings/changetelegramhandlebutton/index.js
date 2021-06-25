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

const ChangeTelegramHandleButton = (props) => {
  const classes = useStyles();
  const [telegramHandle, setTelegramHandle] = useState(props.telegramHandle);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
    setTelegramHandle(props.telegramHandle); // botching because it is not being correctly set on its own
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogSave = () => {
    const updatedSettings = {
      uid: firebaseAuth.currentUser.uid,
      telegramHandle: telegramHandle,
    };
    axios
      .post(
        "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/updateTelegramHandle",
        updatedSettings
      )
      .then(() => {
        alert("Succesfully updated telegram handle");
        props.setTelegramHandle(telegramHandle);
      })
      .catch((error) => {
        alert(
          `Issue updating telegram handle. Error status code: ${error.response.status}. ${error.response.data.message}`
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
        <Typography>
          Telegram Handle: {props.telegramHandle ? "@" + props.telegramHandle : "NIL"}
        </Typography>
      </Button>
      <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change Username</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            required
            fullWidth
            name="telegramHandle"
            label="New Telegram Handle"
            defaultValue={telegramHandle}
            onChange={(e) => {
              setTelegramHandle(e.target.value);
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

ChangeTelegramHandleButton.propTypes = {
  telegramHandle: PropTypes.String,
  setTelegramHandle: PropTypes.func,
};

export default ChangeTelegramHandleButton;
