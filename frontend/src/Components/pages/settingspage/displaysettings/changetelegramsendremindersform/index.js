import React from "react";
import { Grid, FormGroup, FormControlLabel, Switch } from "@material-ui/core";
import PropTypes from "prop-types";

const ChangeTelegramSendReminderForm = (props) => {
  const [telegramSendReminders, setTelegramSendReminders] = props;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTelegramSendReminders(e.target.telegramSendReminders.value);
  };

  return (
    <FormGroup noValidate onSubmit={handleSubmit}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item style={{ width: "80%" }}>
          <FormControlLabel
            control={
              <Switch
                checked={props.telegramSendReminders}
                name="telegramSendReminders"
                defaultChecked={telegramSendReminders}
                color="primary"
              />
            }
            label="Primary"
          />
        </Grid>
      </Grid>
    </FormGroup>
  );
};

ChangeTelegramSendReminderForm.propTypes = {
  telegramSendReminders: PropTypes.bool,
  setTelegramSendReminders: PropTypes.func,
};

export default ChangeTelegramSendReminderForm;
