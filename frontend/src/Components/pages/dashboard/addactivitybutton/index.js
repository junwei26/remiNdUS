import React from "react";
import Popup from "reactjs-popup";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import AddActivityPopup from "./addactivitypopup";

const AddActivityButton = () => {
  return (
    <Popup
      contentStyle={{ width: "400px" }}
      trigger={
        <ListItem button key="Add Activity">
          <ListItemText primary="Add Activity" />
        </ListItem>
      }
      closeOnDocumentClick={false}
      modal
    >
      {(close) => <AddActivityPopup close={close} />}
    </Popup>
  );
};

export default AddActivityButton;
