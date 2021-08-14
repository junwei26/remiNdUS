import React from "react";
import { makeStyles } from "@material-ui/core/styles";
// import { Grid, Divider } from "@material-ui/core";
import { List, ListItem } from "@material-ui/core";
import PropTypes from "prop-types";
import AddButton from "../addbutton";
import SearchActivities from "../searchactivities";
import SearchReminders from "../searchreminders";
import RetrieveActivities from "../retrieveactivities";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    position: "fixed",
    left: "50%",
    bottom: "5%",
    transform: "translateX(-50%)",
    zIndex: 100,
  },
}));

const BottomBar = (props) => {
  const classes = useStyles();

  return (
    <List className={classes.root}>
      <ListItem button component={AddButton} {...props}></ListItem>
      <ListItem button component={SearchActivities} {...props}></ListItem>
      <ListItem button component={SearchReminders} {...props}></ListItem>
      <ListItem button component={RetrieveActivities} {...props}></ListItem>
    </List>
  );
};

BottomBar.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default BottomBar;
