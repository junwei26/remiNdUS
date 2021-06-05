import React from "react";
import Popup from "reactjs-popup";
import { Button } from "@material-ui/core";
import SignUpPopup from "./signuppopup";

const SignupButton = () => {
  return (
    <Popup trigger={<Button color="inherit">Sign Up</Button>} modal>
      {(close) => <SignUpPopup close={close} />}
    </Popup>
  );
};

export default SignupButton;
