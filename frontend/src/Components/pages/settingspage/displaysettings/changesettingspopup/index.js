import React, { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  FormGroup,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
} from "@material-ui/core";
import PropTypes from "prop-types";

const ChangeSettingsPopup = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuSelect = (e) => {};

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <FormGroup noValidate onSubmit={handleSubmit}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item style={{ width: "80%" }}>
          {props.selectedSetting === "username" ? (
            <TextField
              variant="outlined"
              required
              fullWidth
              name="username"
              label="New Username"
              color="primary"
              autofocus
            />
          ) : props.selectedSetting === "telegramHandle" ? (
            <TextField
              variant="outlined"
              required
              fullWidth
              name="telegramHandle"
              label="New Telegram Handle"
              color="primary"
              autofocus
            />
          ) : props.selectedSetting === "telegramSendReminders" ? (
            <FormControlLabel
              control={
                <Switch
                  checked={props.telegramSendReminders}
                  name="telegramSendReminders"
                  color="primary"
                />
              }
              label="Primary"
            />
          ) : (
            <>
              <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                Open Menu
              </Button>
              <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={handleMenuSelect}>06:00 AM</MenuItem>
                <MenuItem onClick={handleMenuSelect}>08:00 AM</MenuItem>
                <MenuItem onClick={handleMenuSelect}>10:00 AM</MenuItem>
              </Menu>
            </>
          )}
        </Grid>
        <Grid item style={{ width: "80%" }}>
          <Button type="submit" fullWidth variant="contained" color="primary">
            Log In
          </Button>
        </Grid>
      </Grid>
    </FormGroup>
  );
};

ChangeSettingsPopup.propTypes = {
  selectedSetting: PropTypes.String,
  username: PropTypes.String,
  telegramHandle: PropTypes.String,
  telegramSendReminders: PropTypes.bool,
  telegramReminderTiming: PropTypes.String,
};

export default ChangeSettingsPopup;
