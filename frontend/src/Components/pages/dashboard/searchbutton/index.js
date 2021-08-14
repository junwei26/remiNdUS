import React, { useState } from "react";
import { ListItem, ListItemIcon } from "@material-ui/core";
import PropTypes from "prop-types";
import SearchReminders from "./searchreminders";
import SearchActivities from "./searchactivities";
import SearchIcon from "@material-ui/icons/Search";

const SearchButton = (props) => {
  // State between search activity or search reminder mode
  const [searchActivity, setSearchActivity] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Search">
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
      </ListItem>
      {searchActivity ? (
        <SearchActivities
          plannerDataUpdate={props.plannerDataUpdate}
          setPlannerDataUpdate={props.setPlannerDataUpdate}
          setSearchActivity={setSearchActivity}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      ) : (
        <SearchReminders
          plannerDataUpdate={props.plannerDataUpdate}
          setPlannerDataUpdate={props.setPlannerDataUpdate}
          setSearchActivity={setSearchActivity}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      )}
    </>
  );
};

SearchButton.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default SearchButton;
