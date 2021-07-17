import React from "react";
import Sidedrawer from "./sidedrawer";
import ReminderList from "./reminderlist";
import { Grid } from "@material-ui/core";
import TimeTracker from "./timetracker";

const Dashboard = () => {
  return (
    <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
      <Grid item xs>
        <Sidedrawer />
      </Grid>
      <Grid item xs={2}>
        <Grid container direction="column" justify="flex-start" alignItems="flex-end" spacing={3}>
          <Grid item xs>
            <ReminderList />
          </Grid>
          <Grid item xs>
            <TimeTracker />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
