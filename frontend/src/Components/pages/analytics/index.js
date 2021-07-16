import PieChart from "./pieChart";
import BarChart from "./barChart";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
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

const DummyData = [
  {
    name: "test 1",
    tag: "tag 1",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 2",
    tag: "tag 1",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 3",
    tag: "tag 2",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 4",
    tag: "tag 2",
    plannedStartDateTime: "202101020000",
    plannedEndDateTime: "202101020500",
    actualStartDateTime: "202101020000",
    actualEndDateTime: "202101020500",
  },
  {
    name: "test 5",
    tag: "tag 3",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 6",
    tag: "tag 3",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 7",
    tag: "tag 4",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 8",
    tag: "tag 4",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 9",
    tag: "tag 4",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 10",
    tag: "tag 4",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 11",
    tag: "tag 5",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 12",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 13",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 14",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 15",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 16",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
];

const Analytics = () => {
  const [active, setActive] = useState(1);
  const SetView = (active) => {
    setActive(active);
  };

  const ActiveView = () => {
    switch (active) {
      case "Activity breakdown by tag":
        return <PieChart data={DummyData} />;
      case "Productivity analysis":
        return <BarChart data={DummyData} />;
      default:
        return <PieChart data={DummyData} />;
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
          <ListItem button key="Activity breakdown by tag">
            <ListItemText
              primary="Activity breakdown by tag"
              onClick={() => SetView("Activity breakdown by tag")}
            />
          </ListItem>
          <ListItem button key="Productivity analysis">
            <ListItemText
              primary="Productivity analysis"
              onClick={() => SetView("Productivity analysis")}
            />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <ActiveView />
      </main>
    </div>
  );
};

export default Analytics;
