import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ButtonGroup, Button, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import ChangeUsernameButton from "./changeusernamebutton";
import ChangeTelegramHandleButton from "./changetelegramhandlebutton";
import ChangeTelegramSendReminderButton from "./changetelegramsendremindersbutton";
import ChangeTelegramReminderTimingButton from "./changetelegramremindertimingbutton";

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
        <ChangeUsernameButton username={props.username} setUsername={props.setUsername} />
        <Button className={classes.button} disabled>
          <Typography>
            Tutor verification: {props.verified ? "Verified" : "Not verified"}
          </Typography>
        </Button>
        <ChangeTelegramHandleButton
          telegramHandle={props.telegramHandle}
          setTelegramHandle={props.setTelegramHandle}
        />
        <ChangeTelegramSendReminderButton
          telegramSendReminders={props.telegramSendReminders}
          setTelegramSendReminders={props.setTelegramSendReminders}
        />
        <ChangeTelegramReminderTimingButton
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
