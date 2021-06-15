import React from "react";
import { Grid } from "@material-ui/core";
import PropTypes from "prop-types";

const DisplaySettings = (props) => {
  return (
    <>
      <Grid container direction="column" justify="center" alignItems="flex-start" spacing={2}>
        <Grid item>Username: {props.username}</Grid>
        <Grid item>Tutor verification: {props.verified ? "Verified" : "Not verified"}</Grid>
        <Grid item>Telegram Handle: {props.telegramHandle}</Grid>
        <Grid item>Send reminders on telegram?: {props.telegramSendReminders}</Grid>
        <Grid item>Telegram Reminder Timing: {props.telegramReminderTiming}</Grid>
      </Grid>
    </>
  );
};

DisplaySettings.propTypes = {
  username: PropTypes.string,
  verified: PropTypes.bool,
  telegramHandle: PropTypes.string,
  telegramSendReminders: PropTypes.bool,
  telegramReminderTiming: PropTypes.string,
};

export default DisplaySettings;
