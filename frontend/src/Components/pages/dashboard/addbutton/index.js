import React, { useState } from "react";
import { ListItem, ListItemIcon } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import PropTypes from "prop-types";
import AddActivityButton from "../addactivitybutton";
import AddReminderButton from "../addreminderbutton";

const AddButton = (props) => {
  // State between add activity or add reminder mode
  const [addActivity, setAddActivity] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Add">
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
      </ListItem>
      {addActivity ? (
        <AddActivityButton
          plannerDataUpdate={props.plannerDataUpdate}
          setPlannerDataUpdate={props.setPlannerDataUpdate}
          setAddActivity={setAddActivity}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      ) : (
        <AddReminderButton
          plannerDataUpdate={props.plannerDataUpdate}
          setPlannerDataUpdate={props.setPlannerDataUpdate}
          setAddActivity={setAddActivity}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      )}
    </>
  );
};

AddButton.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default AddButton;
