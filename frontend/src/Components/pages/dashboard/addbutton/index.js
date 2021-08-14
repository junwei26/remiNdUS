import React, { useState } from "react";
import { ListItem, ListItemIcon } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import PropTypes from "prop-types";
import AddActivity from "./addactivity";
import AddReminder from "./addreminder";

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
        <AddActivity
          plannerDataUpdate={props.plannerDataUpdate}
          setPlannerDataUpdate={props.setPlannerDataUpdate}
          setAddActivity={setAddActivity}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      ) : (
        <AddReminder
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
