import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ButtonGroup, Button, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import ChangeTelegramReminderTimingForm from "./changetelegramremindertimingform";

const useStyles = makeStyles(() => ({
  buttonGroup: {
    flexGrow: 1,
    width: "100%",
  },
  button: {
    justifyContent: "flex-start",
    paddingTop: "5%",
    paddingBottom: "5%",
  },
}));

const DisplaySettings = (props) => {
  const classes = useStyles();

  return (
    <>
      <ButtonGroup
        className={classes.buttonGroup}
        orientation="vertical"
        variant="outlined"
        color="primary"
        aria-label="vertical contained primary button group"
      >
        <Button className={classes.button}>
          <Typography>Username: {props.username ? props.username : "Not set-up"}</Typography>
        </Button>
        <Button className={classes.button} disabled>
          <Typography>
            Tutor verification: {props.verified ? "Verified" : "Not verified"}
          </Typography>
        </Button>
        <Button className={classes.button}>
          <Typography>
            Telegram Handle: {props.telegramHandle ? props.telegramHandle : "NIL"}
          </Typography>
        </Button>
        <Button className={classes.button}>
          <Typography>Telegram reminders: {props.telegramSendReminders ? "On" : "Off"}</Typography>
        </Button>
        <ChangeTelegramReminderTimingForm
          telegramReminderTiming={props.telegramReminderTiming}
          setTelegramReminderTiming={props.setTelegramReminderTiming}
        />
      </ButtonGroup>
    </>
  );
};

DisplaySettings.propTypes = {
  username: PropTypes.string,
  verified: PropTypes.bool,
  telegramHandle: PropTypes.string,
  telegramSendReminders: PropTypes.bool,
  telegramReminderTiming: PropTypes.string,
  setUsername: PropTypes.func,
  setTelegramHandle: PropTypes.func,
  setTelegramSendReminders: PropTypes.func,
  setTelegramReminderTiming: PropTypes.func,
};

export default DisplaySettings;
