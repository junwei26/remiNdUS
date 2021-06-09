import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import WeeklyView from "./weeklyview";

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

const Test1 = () => {
  return <div> Test 1</div>;
};
const Test2 = () => {
  return <div> Test 2</div>;
};

const Sidedrawer = () => {
  const [active, setActive] = useState(1);
  const SetView = (active) => {
    setActive(active);
  };

  const ActiveView = () => {
    switch (active) {
      case "Weekly View":
        return <WeeklyView />;
      case 2:
        return <Test2 />;
      default:
        return <Test1 />;
    }
  };
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Permanent drawer
          </Typography>
        </Toolbar>
      </AppBar>
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
          <ListItem button key="Weekly View">
            <ListItemText primary="Weekly View" onClick={() => SetView("Weekly View")} />
          </ListItem>
          <ListItem button key="Monthly View">
            <ListItemText primary="Monthly View" onClick={() => SetView(2)} />
          </ListItem>
          <ListItem button key="Add Activity">
            <ListItemText primary="Add Activity" onClick={() => SetView(2)} />
          </ListItem>
          <ListItem button key="Add Reminder">
            <ListItemText primary="Add Reminder" onClick={() => SetView(2)} />
          </ListItem>
          <ListItem button key="Mass edit planner">
            <ListItemText primary="Mass edit planner" onClick={() => SetView(2)} />
          </ListItem>
          <ListItem button key="Search activities">
            <ListItemText primary="Search activities" onClick={() => SetView(2)} />
          </ListItem>
          <ListItem button key="Search reminders">
            <ListItemText primary="Search reminders" onClick={() => SetView(2)} />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <ActiveView />
      </main>
    </div>
  );
};
export default Sidedrawer;
