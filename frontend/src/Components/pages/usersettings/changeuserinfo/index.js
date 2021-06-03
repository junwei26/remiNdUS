import React from "react";
import PropTypes from "prop-types";
import { TextField, Button } from "@material-ui/core";
import { firebaseAuth } from "../../../../firebase";
import * as userSettings from "../../../../firebaseAuth/userSettings";

const ChangeUserInfo = (props) => {
  const handleSubmitChangeUserInfo = (e) => {
    e.preventDefault();
    if (userSettings.updateProfile(e.target.name.value, e.target.photoURL.value)) {
      props.onChangeUserInfo(e.target.name.value, e.target.photoURL.value);
    }
  };

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmitChangeUserInfo}>
      <div>
        <TextField
          required
          id="filled-required"
          name="name"
          label="New Name"
          defaultValue={`${firebaseAuth.currentUser.displayName}`}
          variant="filled"
        />
      </div>
      <div>
        <TextField
          id="filled-required"
          name="photoURL"
          label="Photo URL"
          defaultValue={`${firebaseAuth.currentUser.photoURL}`}
          variant="filled"
        />
      </div>
      <div>
        <Button variant="contained" color="primary" type="submit">
          Submit Changes
        </Button>
      </div>
    </form>
  );
};

ChangeUserInfo.propTypes = {
  onChangeUserInfo: PropTypes.func,
};

export default ChangeUserInfo;
