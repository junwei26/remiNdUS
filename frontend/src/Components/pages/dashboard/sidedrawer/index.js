import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer, CssBaseline, List, Divider } from "@material-ui/core";
import PropTypes from "prop-types";
import AddActivityButton from "../addactivitybutton";
import AddReminderButton from "../addreminderbutton";
import SearchActivities from "../searchactivities";
import SearchReminders from "../searchreminders";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

const Sidedrawer = (props) => {
  const classes = useStyles();

  return (
    <div style={{ width: drawerWidth }}>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar} />
        <Divider />
        <List>
          <AddActivityButton
            plannerDataUpdate={props.plannerDataUpdate}
            setPlannerDataUpdate={props.setPlannerDataUpdate}
          />
          <SearchActivities
            plannerDataUpdate={props.plannerDataUpdate}
            setPlannerDataUpdate={props.setPlannerDataUpdate}
          />
          <AddReminderButton
            plannerDataUpdate={props.plannerDataUpdate}
            setPlannerDataUpdate={props.setPlannerDataUpdate}
          />
          <SearchReminders
            plannerDataUpdate={props.plannerDataUpdate}
            setPlannerDataUpdate={props.setPlannerDataUpdate}
          />
        </List>
      </Drawer>
    </div>
  );
};

Sidedrawer.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default Sidedrawer;
