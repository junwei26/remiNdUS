import React from "react";
import Popup from "reactjs-popup";
import { Button } from "@material-ui/core";
import AddActivityPopup from "./addactivitypopup";

const AddActivityButton = () => {
  return (
    <Popup
      contentStyle={{ width: "400px" }}
      trigger={<Button color="inherit">Add Activity</Button>}
      closeOnDocumentClick={false}
      modal
    >
      {(close) => <AddActivityPopup close={close} />}
    </Popup>
  );
};

export default AddActivityButton;
