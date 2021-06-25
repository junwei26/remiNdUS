import React from "react";
import Sidedrawer from "./sidedrawer";
import ReminderList from "./reminderlist";
import { Grid } from "@material-ui/core";
import TimeTracker from "./timetracker";

const Dashboard = () => {
  return (
    <Grid container direction="row" justify="top" alignItems="top" spacing={2}>
      <Grid item xs>
        <Sidedrawer />
      </Grid>
      <Grid item xs={2}>
        <Grid container direction="column" justify="top" alighnItems="right" spacing={3}>
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
