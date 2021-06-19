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

const ChangeTelegramSendReminderButton = (props) => {
  const classes = useStyles();
  const [telegramSendReminders, setTelegramSendReminders] = useState(props.telegramSendReminders);

  const [dialogOpen, setDialogOpen] = useState(false);

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
        "http://localhost:5001/remindus-76402/asia-southeast2/backendAPI/api/user/updateTelegramSendReminders",
        updatedSettings
      )
      .then(() => {
        alert("Succesfully updated send telegram reminders");
        props.setTelegramSendReminders(telegramSendReminders);
      })
      .catch((error) => {
        alert(
          `Issue updating send telegram reminders. Error status code: ${error.response.status}. ${error.response.data.message}`
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
