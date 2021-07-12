import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import { List, Divider, ListItem, ListItemText } from "@material-ui/core";
import SubscribedPackages from "./subscribedpackages";
import CreatePackages from "./createpackages";
import SearchPackages from "./searchpackages";
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

const Sidedrawer = () => {
  const [active, setActive] = useState(1);
  const [selectedReminderPackage, setSelectedReminderPackage] = useState([]);
  const setView = (active) => {
    setActive(active);
  };

  const ActiveView = () => {
    switch (active) {
      case "Subscribed Packages":
        return (
          <SubscribedPackages
            setSelectedReminderPackage={setSelectedReminderPackage}
            setView={setView}
          />
        );
      case "Search Packages":
        return <SearchPackages />;
      case "Create Packages":
        return <CreatePackages reminderPackage={selectedReminderPackage} />;
      default:
        return (
          <SubscribedPackages
            setSelectedReminderPackage={setSelectedReminderPackage}
            setView={setView}
          />
        );
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
          <ListItem button key="Subscribed Packages">
            <ListItemText
              primary="Subscribed Packages"
              onClick={() => setView("Subscribed Packages")}
            />
          </ListItem>
          <ListItem button key="Search Packages">
            <ListItemText primary="Search Packages" onClick={() => setView("Search Packages")} />
          </ListItem>
          <ListItem button key="Create Packages">
            <ListItemText primary="Create Packages" onClick={() => setView("Create Packages")} />
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
