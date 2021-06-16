import React from "react";
import { Grid, TextField, FormGroup } from "@material-ui/core";
import PropTypes from "prop-types";

const changeTelegramHandleForm = (props) => {
  const [telegramHandle, setTelegramHandle] = props;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTelegramHandle(e.target.username.value);
  };

  return (
    <FormGroup noValidate onSubmit={handleSubmit}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item style={{ width: "80%" }}>
          <TextField
            variant="outlined"
            required
            fullWidth
            name="telegramHandle"
            label="New Telegram Handle"
            defaultValue={telegramHandle}
            color="primary"
            autofocus
          />
        </Grid>
      </Grid>
    </FormGroup>
  );
};

changeTelegramHandleForm.propTypes = {
  telegramHandle: PropTypes.String,
  setTelegramHandle: PropTypes.func,
};

export default changeTelegramHandleForm;
