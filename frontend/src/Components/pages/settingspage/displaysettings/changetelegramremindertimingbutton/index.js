import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Menu,
  MenuItem,
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

const ChangeTelegramReminderTimingButton = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [telegramReminderTiming, setTelegramReminderTiming] = useState(
    props.telegramReminderTiming
  );

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
    setTelegramReminderTiming(props.telegramReminderTiming); // botching because it is not being correctly set on its own
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogSave = () => {
    const updatedSettings = {
      uid: firebaseAuth.currentUser.uid,
      telegramReminderTiming: telegramReminderTiming,
    };
    axios
      .post(
        "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/updateTelegramReminderTiming",
        updatedSettings
      )
      .then(() => {
        setCurrentAlert({ severity: "success", message: "Succesfully updated reminder timing" });
        setSnackbarOpen(true);
        props.setTelegramReminderTiming(telegramReminderTiming);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message: `Issue updating reminder timing. Error status code: ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
    handleDialogClose();
  };

  const handleMenuClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const setTimingToSix = () => {
    setTelegramReminderTiming("0600");
    handleMenuClose();
  };
  const setTimingToEight = () => {
    setTelegramReminderTiming("0800");
    handleMenuClose();
  };
  const setTimingToTen = () => {
    setTelegramReminderTiming("1000");
    handleMenuClose();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        <Typography>Telegram Reminder Timing: {props.telegramReminderTiming}</Typography>
      </Button>
      <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change Telegram Reminder Timing</DialogTitle>
        <DialogContent>
          <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleMenuClick}>
            <Typography>
              {telegramReminderTiming === "0600"
                ? "06:00 AM"
                : telegramReminderTiming === "0800"
                ? "08:00 AM"
                : "10:00 AM"}
            </Typography>
          </Button>
          <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={setTimingToSix}>06:00 AM</MenuItem>
            <MenuItem onClick={setTimingToEight}>08:00 AM</MenuItem>
            <MenuItem onClick={setTimingToTen}>10:00 AM</MenuItem>
          </Menu>
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

ChangeTelegramReminderTimingButton.propTypes = {
  telegramReminderTiming: PropTypes.string,
  setTelegramReminderTiming: PropTypes.func,
};

export default ChangeTelegramReminderTimingButton;
