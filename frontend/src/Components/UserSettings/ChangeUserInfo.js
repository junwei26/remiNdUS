import React from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid } from "@material-ui/core";
import { firebaseAuth } from "../../firebase";
import * as userSettings from "../../firebaseAuth/userSettings";

const ChangeUserInfo = (props) => {
  const handleSubmitChangeUserInfo = (e) => {
    e.preventDefault();
    if (userSettings.updateProfile(e.target.name.value, e.target.photoURL.value)) {
      props.onChangeUserInfo(e.target.name.value, e.target.photoURL.value);
    }
  };

  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <form noValidate autoComplete="off" onSubmit={handleSubmitChangeUserInfo}>
        <Grid item>
          <TextField
            required
            id="filled-required"
            name="name"
            label="New Name"
            defaultValue={`${firebaseAuth.currentUser.displayName}`}
            variant="filled"
          />
        </Grid>
        <Grid item>
          <TextField
            id="filled-required"
            name="photoURL"
            label="Photo URL"
            defaultValue={`${firebaseAuth.currentUser.photoURL}`}
            variant="filled"
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" type="submit">
            Submit Changes
          </Button>
        </Grid>
      </form>
    </Grid>
  );
};

ChangeUserInfo.propTypes = {
  onChangeUserInfo: PropTypes.func,
};

export default ChangeUserInfo;
