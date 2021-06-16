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
} from "@material-ui/core";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  button: {
    justifyContent: "flex-start",
    paddingTop: "5%",
    paddingBottom: "5%",
  },
}));

const ChangeTelegramReminderTimingForm = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [telegramReminderTiming, setTelegramReminderTiming] = useState(
    props.telegramReminderTiming
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogSave = () => {
    //   callbackend
    props.setTelegramReminderTiming(telegramReminderTiming);
    handleDialogClose();
  };

  const handleMenuClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const setTimingToSix = () => {
    setTelegramReminderTiming("0600");
  };
  const setTimingToEight = () => {
    setTelegramReminderTiming("0800");
  };
  const setTimingToTen = () => {
    setTelegramReminderTiming("1000");
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
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
            Open Menu
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

ChangeTelegramReminderTimingForm.propTypes = {
  telegramReminderTiming: PropTypes.bool,
  setTelegramReminderTiming: PropTypes.func,
};

export default ChangeTelegramReminderTimingForm;
