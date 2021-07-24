import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Switch,
  Dialog,
  Grid,
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

const ChangeTelegramSendReminderButton = (props) => {
  const classes = useStyles();
  const [telegramSendReminders, setTelegramSendReminders] = useState(props.telegramSendReminders);

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
    setTelegramSendReminders(props.telegramSendReminders); // botching because it is not being correctly set on its own
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogSave = () => {
    const updatedSettings = {
      uid: firebaseAuth.currentUser.uid,
      telegramSendReminders: telegramSendReminders,
    };
    axios
      .post(
        "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/updateTelegramSendReminders",
        updatedSettings
      )
      .then(() => {
        setCurrentAlert({
          severity: "success",
          message: "Succesfully updated send telegram reminders",
        });
        setSnackbarOpen(true);
        props.setTelegramSendReminders(telegramSendReminders);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message: `Issue updating send telegram reminders. Error status code: ${error.response.status}. ${error.response.data.message}`,
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
        <Typography>Telegram reminders: {props.telegramSendReminders ? "On" : "Off"}</Typography>
      </Button>

      <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change Username</DialogTitle>
        <DialogContent>
          <Grid container direction="row" alignItems="center">
            <Typography>Send Telegram Reminders</Typography>
            <Switch
              name="telegramSendReminders"
              checked={telegramSendReminders}
              defaultChecked={props.telegramSendReminders}
              onChange={(e) => {
                setTelegramSendReminders(e.target.checked);
              }}
              color="primary"
            />
          </Grid>
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

ChangeTelegramSendReminderButton.propTypes = {
  telegramSendReminders: PropTypes.bool,
  setTelegramSendReminders: PropTypes.func,
};

export default ChangeTelegramSendReminderButton;
