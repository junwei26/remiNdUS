import React from "react";
import Popup from "reactjs-popup";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import AddReminderPopup from "./addreminderpopup";

const AddReminderButton = () => {
  return (
    <Popup
      contentStyle={{ width: "400px" }}
      trigger={
        <ListItem button key="Add Reminder">
          <ListItemText primary="Add Reminder" />
        </ListItem>
      }
      closeOnDocumentClick={false}
      modal
    >
      {(close) => <AddReminderPopup close={close} />}
    </Popup>
  );
};

export default AddReminderButton;
