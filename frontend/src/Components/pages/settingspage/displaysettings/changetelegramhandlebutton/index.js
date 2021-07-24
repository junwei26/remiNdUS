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
  Snackbar,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
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
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

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
        setCurrentAlert({ severity: "success", message: "Succesfully updated telegram handle" });
        setSnackbarOpen(true);
        props.setTelegramHandle(telegramHandle);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message: `Issue updating telegram handle. Error status code: ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
    handleDialogClose();
  };

  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
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
