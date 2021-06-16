import React from "react";
import { Grid, TextField, FormGroup } from "@material-ui/core";
import PropTypes from "prop-types";

const changeUsernameForm = (props) => {
  const [username, setUsername] = props;

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
  };

  return (
    <FormGroup noValidate onSubmit={handleSubmit}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item style={{ width: "80%" }}>
          <TextField
            variant="outlined"
            required
            fullWidth
            name="username"
            label="New Username"
            defaultValue={username}
            color="primary"
            autofocus
          />
        </Grid>
      </Grid>
    </FormGroup>
  );
};

changeUsernameForm.propTypes = {
  username: PropTypes.String,
  setUsername: PropTypes.func,
};

export default changeUsernameForm;
