import React, { useState } from "react";
import Sidedrawer from "./sidedrawer";
import ReminderList from "./reminderlist";
import { Grid } from "@material-ui/core";
import TimeTracker from "./timetracker";
import Planner from "./planner";
const drawerWidth = 240;

const Dashboard = () => {
  const [plannerDataUpdate, setPlannerDataUpdate] = useState(false);

  return (
    <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
      <Grid item style={{ width: 280 }}>
        <Sidedrawer
          plannerDataUpdate={plannerDataUpdate}
          setPlannerDataUpdate={setPlannerDataUpdate}
        />
      </Grid>
      <Grid
        container
        item
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
        style={{ width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth }}
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
    </Grid>
  );
};

export default Dashboard;
