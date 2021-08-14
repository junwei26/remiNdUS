import React, { useState } from "react";
// import { makeStyles } from "@material-ui/core/styles";
// import Sidedrawer from "./sidedrawer";
import BottomBar from "./bottombar";
import ReminderList from "./reminderlist";
import { Grid } from "@material-ui/core";
import TimeTracker from "./timetracker";
import Planner from "./planner";
// const drawerWidth = 240;

// const useStyles = makeStyles(() => ({
//   topBar: {},
// }));

const Dashboard = () => {
  // const classes = useStyles();
  const [plannerDataUpdate, setPlannerDataUpdate] = useState(false);

  return (
    <>
      <BottomBar
        // className={classes.topBar}
        plannerDataUpdate={plannerDataUpdate}
        setPlannerDataUpdate={setPlannerDataUpdate}
        style={{
          left: "70%",
          right: "70%",
          position: "fixed",
        }}
      />
      <Grid
        container
        item
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
        // style={{ width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth }}
      >
        <Grid item xs>
          <Planner
            plannerDataUpdate={plannerDataUpdate}
            setPlannerDataUpdate={setPlannerDataUpdate}
          />
        </Grid>
        <Grid
          container
          item
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
          spacing={3}
          xs={3}
        >
          <Grid item>
            <ReminderList />
          </Grid>
          <Grid item>
            <TimeTracker />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
