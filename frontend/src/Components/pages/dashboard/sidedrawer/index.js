import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Planner from "./planner";
import AddActivityButton from "../addactivitybutton";
import AddReminderButton from "../addreminderbutton";
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

const MassEditPlanner = () => {
  return <div> Mass edit planner </div>;
};

const SearchActivities = () => {
  return <div> Search activities </div>;
};

const SearchReminders = () => {
  return <div> Search reminders </div>;
};

const Sidedrawer = () => {
  const [active, setActive] = useState(1);
  const SetView = (active) => {
    setActive(active);
  };

  const ActiveView = () => {
    switch (active) {
      case "Planner View":
        return <Planner />;
      case "Mass edit planner":
        return <MassEditPlanner />;
      case "Search activities":
        return <SearchActivities />;
      case "Search reminders":
        return <SearchReminders />;
      default:
        return <Planner />;
    }
  };
  const classes = useStyles();

  return (
    <div className={classes.root}>
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
          <ListItem button key="Planner View">
            <ListItemText primary="Planner View" onClick={() => SetView("Planner View")} />
          </ListItem>
          <AddActivityButton />
          <AddReminderButton />
          <ListItem button key="Mass edit planner">
            <ListItemText
              primary="Mass edit planner"
              onClick={() => SetView("Mass edit planner")}
            />
          </ListItem>
          <ListItem button key="Search activities">
            <ListItemText
              primary="Search activities"
              onClick={() => SetView("Search activities")}
            />
          </ListItem>
          <ListItem button key="Search reminders">
            <ListItemText primary="Search reminders" onClick={() => SetView("Search reminders")} />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <ActiveView />
      </main>
    </div>
  );
};
export default Sidedrawer;
