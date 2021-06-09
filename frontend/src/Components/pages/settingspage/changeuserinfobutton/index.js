import React from "react";
import PropTypes from "prop-types";
import Popup from "reactjs-popup";
import { Button } from "@material-ui/core";
import ChangeUserInfoPopup from "./changeuserinfopopup";

const ChangeUserInfoButton = (props) => {
  return (
    <Popup
      contentStyle={{ width: "400px" }}
      trigger={
        <Button variant="contained" color="inherit">
          Change User Information
        </Button>
      }
      modal
    >
      {(close) => <ChangeUserInfoPopup close={close} onChangeUserInfo={props.onChangeUserInfo} />}
    </Popup>
  );
};

ChangeUserInfoButton.propTypes = {
  onChangeUserInfo: PropTypes.func,
};

export default ChangeUserInfoButton;
