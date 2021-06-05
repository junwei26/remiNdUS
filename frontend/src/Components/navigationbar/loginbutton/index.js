import React from "react";
import Popup from "reactjs-popup";
import { Button } from "@material-ui/core";
import LoginPopup from "./loginpopup";

const LoginButton = () => {
  return (
    <Popup contentStyle={{ width: "400px" }} trigger={<Button color="inherit">Login</Button>} modal>
      {(close) => <LoginPopup close={close} />}
    </Popup>
  );
};

export default LoginButton;
